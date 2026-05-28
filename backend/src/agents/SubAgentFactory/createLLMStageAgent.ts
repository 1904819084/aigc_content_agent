import { fornaxExecute } from '../../fornax/llm';
import { formatZodIssues, getStageOutputSchema } from '../../domain/task/stageSchemas';
import type { StageOutputMap, Task, TaskStageName } from '../../types';
import { tryParseAgentJson } from '../../utils/agentOutput';
import { AppError, toAppError } from '../../utils/appError';

/**
 * fornaxExecute 返回类型的最小子集，工厂只关心解析结果所需字段。
 */
export type FornaxResponse = {
  ok: boolean;
  error: string | null | unknown;
  text: string;
  raw?: unknown;
};

/**
 * 把 fornax 响应转成「待 zod 校验」的原始 value：
 * - 默认行为：response.text 走 tryParseAgentJson 取 JSON value；
 * - 图片这类需要从 response.raw 中抽 parts 的 stage，可传自定义 extractor。
 *
 * 返回 null 表示连 JSON 都没拿到（response.ok=false 或 text 为空），工厂会抛 invalidSchemaError。
 */
export type ResponseValueExtractor<Ctx> = (response: FornaxResponse, task: Task, ctx: Ctx) => unknown;

const defaultExtractor: ResponseValueExtractor<unknown> = (response) => {
  if (!response.ok || !response.text) {
    return null;
  }
  return tryParseAgentJson(response.text);
};

export type LLMStageAgentConfig<S extends TaskStageName, Ctx> = {
  /** 阶段名：用于查 zod schema、记录 stage output。 */
  stageName: S;
  /** 阶段对应的 prompt key */
  promptKey: string;
  /** 可选 prompt 版本 */
  promptVersion?: string;
  /**
   * 提取上游产物组成的 input 对象。该对象会作为 stage output 的 `input` 字段被持久化，
   * 默认也会作为 fornax variables（每个 value JSON.stringify）。
   */
  getInput: (task: Task, ctx: Ctx) => Record<string, unknown>;
  /**
   * 自定义把 input 映射到 fornax variables 的逻辑。省略时默认对每个 value 做 JSON.stringify。
   */
  getVariables?: (
    input: Record<string, unknown>,
    task: Task,
    ctx: Ctx,
  ) => Record<string, unknown>;
  /**
   * 从 fornax response 中提取「待 zod 校验」的原始 JSON value。省略时使用 defaultExtractor，
   * 即从 response.text 走 tryParseAgentJson。
   */
  extractValue?: ResponseValueExtractor<Ctx>;
  /** parseResult 失败/zod 校验失败时抛出的错误 code */
  invalidSchemaError: string;
  /** 兜底错误 code（用于网络/SDK 异常） */
  executeError: string;
  /** 自定义 callOptions */
  callOptions?: Record<string, unknown>;
};

const stringifyVariables = (input: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, JSON.stringify(value, null, 2)]),
  );

/**
 * LLM 类阶段 agent 通用工厂：收敛 6 个 LLM agent 中重复的「取上游产物 → 调 prompt → zod 校验 → 错误处理」骨架。
 *
 * - 默认上下文为 void（runXxxAgent(task)），调用方传第二参数时可在工厂泛型 Ctx 上指定类型（如 QaReviewTargetStage）。
 * - 校验通过 `STAGE_OUTPUT_SCHEMAS[stageName]` 自动查表，保证 stage 与 schema 一一对应。
 */
export function createLLMStageAgent<S extends TaskStageName, Ctx = void>(
  config: LLMStageAgentConfig<S, Ctx>,
) {
  const schema = getStageOutputSchema(config.stageName);
  const extractValue = (config.extractValue ?? defaultExtractor) as ResponseValueExtractor<Ctx>;

  return async function runLLMStageAgent(task: Task, ctx: Ctx = undefined as Ctx) {
    const input = config.getInput(task, ctx);
    const variables = config.getVariables
      ? config.getVariables(input, task, ctx)
      : stringifyVariables(input);

    try {
      const response = await fornaxExecute({
        promptKey: config.promptKey,
        promptVersion: config.promptVersion,
        variables,
        callOptions: config.callOptions ?? {},
      });

      const rawValue = extractValue(response, task, ctx);
      if (rawValue === null || rawValue === undefined) {
        throw new AppError(config.invalidSchemaError, 502);
      }

      const parsed = schema.safeParse(rawValue);
      if (!parsed.success) {
        // 把字段级 issue 拼到 message，便于日志/前端直接看到 LLM 哪个字段不合法。
        throw new AppError(
          `${config.invalidSchemaError}:${formatZodIssues(parsed.error)}`,
          502,
        );
      }

      return {
        input,
        output: parsed.data as StageOutputMap[S],
      };
    } catch (error) {
      throw toAppError(error, config.executeError, 502);
    }
  };
}
