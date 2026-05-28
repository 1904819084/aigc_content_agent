import { fornaxExecute } from '../../fornax/llm';
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

export type LLMStageAgentConfig<S extends TaskStageName, Ctx> = {
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
   * 解析 fornax 响应得到阶段产物。可基于 `text`（默认走 tryParseAgentJson）或 `raw`。
   * 返回 null 表示 schema 不合法，会抛出 invalidSchemaError。
   */
  parseResult: (
    response: FornaxResponse,
    task: Task,
    ctx: Ctx,
  ) => StageOutputMap[S] | null;
  /** parseResult 返回 null 时抛出的错误 code */
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
 * LLM 类阶段 agent 通用工厂：收敛 6 个 LLM agent 中重复的「取上游产物 → 调 prompt → 解析结果 → 错误处理」骨架。
 *
 * - 默认上下文为 void（runXxxAgent(task)），调用方传第二参数时可在工厂泛型 Ctx 上指定类型（如 QaReviewTargetStage）。
 * - parseResult 接收完整 fornax response，需要 raw（图片）或 text（其他 JSON）的阶段都可由调用方决定。
 */
export function createLLMStageAgent<S extends TaskStageName, Ctx = void>(
  config: LLMStageAgentConfig<S, Ctx>,
) {
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

      const output = config.parseResult(response, task, ctx);

      if (output === null || output === undefined) {
        throw new AppError(config.invalidSchemaError, 502);
      }

      return {
        input,
        output,
      };
    } catch (error) {
      throw toAppError(error, config.executeError, 502);
    }
  };
}

/**
 * 默认的 text → JSON 解析包装器：常用于结果是 JSON 文本的阶段。
 * 调用方传入「JSON value → output | null」的转换函数即可。
 */
export function buildJsonResultParser<S extends TaskStageName, Ctx>(
  build: (value: unknown, task: Task, ctx: Ctx) => StageOutputMap[S] | null,
) {
  return (response: FornaxResponse, task: Task, ctx: Ctx): StageOutputMap[S] | null => {
    if (!response.ok || !response.text) {
      return null;
    }
    return build(tryParseAgentJson(response.text), task, ctx);
  };
}
