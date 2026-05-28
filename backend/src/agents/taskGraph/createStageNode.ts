import type {
  QaReviewResult,
  StageOutputMap,
  Task,
  TaskRepository,
  TaskStageName,
} from '../../types';
import { createStageOutput } from '../../utils/createStageOutput';

// LangGraph 节点接收到的最小 state，仅承载任务 _id（详情走 Mongo）。
type TaskGraphState = {
  _id: string;
};

/**
 * 业务 agent 统一签名（按 stageName 泛型化）：
 *  - input：写入 Mongo 的输入快照（结构由各 agent 自由选择，仅约束为可序列化对象）
 *  - output：必须满足 StageOutputMap[S]，让上下游契约一处变更全链路报错
 */
export type StageAgent<S extends TaskStageName = TaskStageName> = (task: Task) => Promise<{
  input: Record<string, unknown>;
  output: StageOutputMap[S];
}>;

async function setStageRunning(
  taskRepository: TaskRepository,
  _id: string,
  stageName: TaskStageName,
) {
  const task = await taskRepository.markStageRunning(_id, stageName);

  if (!task) {
    throw new Error('task_not_found');
  }
}

async function setStageCompleted<S extends TaskStageName>(
  taskRepository: TaskRepository,
  _id: string,
  stageName: S,
  outputData: Awaited<ReturnType<StageAgent<S>>>,
) {
  const output = createStageOutput(stageName, outputData);
  const task = await taskRepository.markStageCompleted(_id, stageName, output);

  if (!task) {
    throw new Error('task_not_found');
  }
}

async function setStageFailed(
  taskRepository: TaskRepository,
  _id: string,
  stageName: TaskStageName,
  error: unknown,
) {
  const task = await taskRepository.markStageFailed(
    _id,
    stageName,
    error instanceof Error ? error.message : 'unknown_error',
  );

  if (!task) {
    return;
  }
}

/**
 * Graph 节点装配模板：把任意业务 agent 包装成 LangGraph 节点。
 *
 * 职责：
 *   1. 把当前阶段在 Mongo 中标记为 running
 *   2. 调用业务 agent 拿到 input/output
 *   3. 把阶段写回 completed 或 failed
 *   4. 返回空 state，避免 DAG 并发分支回写共享 state 触发冲突
 */
export function createStageNode<S extends TaskStageName>(
  taskRepository: TaskRepository,
  stageName: S,
  stageAgent: StageAgent<S>,
) {
  return async (state: TaskGraphState) => {
    const _id = state._id;

    try {
      await setStageRunning(taskRepository, _id, stageName);
      const task = await taskRepository.findById(_id);

      if (!task) {
        throw new Error('task_not_found');
      }

      if (!stageAgent) {
        throw new Error('stage_agent_missing');
      }

      const outputData = await stageAgent(task);
      await setStageCompleted(taskRepository, _id, stageName, outputData);
      // DAG 并发分支已经把阶段状态写入 Mongo，不再回写共享 graph state，
      // 避免 LangGraph 在同一步收到多个 currentStage/error 更新而报并发冲突。
      return {};
    } catch (error) {
      await setStageFailed(taskRepository, _id, stageName, error);
      throw error instanceof Error ? error : new Error('unknown_error');
    }
  };
}


// QA 失败回溯单条 stage 重试上限，超限后熔断把任务整体标失败，避免无限循环。
export const MAX_QA_ATTEMPTS = 3;

/**
 * QA 节点的条件路由工厂：根据 QA 阶段产出的 decision 决定下一步走 pass 还是 fail 分支。
 *
 * - decision === 'pass'：走下游 nextNode
 * - decision === 'fail' 且 attempts < MAX_QA_ATTEMPTS：把 attempts 累加到「回溯目标 stage」
 *   （即 resetStageNames[0]，真正被重做的那个，比如 image_generating），重置目标及其下游 stage
 *   状态，走 fallbackNode 重做
 * - decision === 'fail' 且 attempts >= MAX_QA_ATTEMPTS：熔断 —— 把 QA 阶段标失败并抛错，
 *   由 taskRunner 的 catch 把任务整体落到 status=failed，绝不静默走 END 让任务伪装成 completed。
 * - 输出缺失/解析异常：同样视为不可恢复错误，直接抛错让任务标 failed。
 *
 * 返回的字符串必须命中 path map 中已声明的 key（pass / fail），由 graph 文件统一声明落点。
 */
export function createQaConditionalRouter(params: {
  taskRepository: TaskRepository;
  qaStageName: TaskStageName;
  // QA 失败时需要重置并重跑的下游 stage 名，按拓扑顺序排列。
  // 第 0 项即「回溯目标」（真正被重做的 stage），attempts 计在这里。
  resetStageNames: TaskStageName[];
}) {
  const { taskRepository, qaStageName, resetStageNames } = params;
  // 业务约束：必须显式声明回溯目标，否则路由不知道把 attempts 计到哪。
  const retryTargetStageName = resetStageNames[0];
  if (!retryTargetStageName) {
    throw new Error('qa_router_requires_reset_target');
  }

  return async (state: TaskGraphState): Promise<'pass' | 'fail'> => {
    const task = await taskRepository.findById(state._id);

    if (!task) {
      throw new Error('task_not_found');
    }

    const qaOutput = task.outputs?.[qaStageName];
    const result = qaOutput?.output as QaReviewResult | undefined;
    // attempts 挂在「回溯目标 stage」上，语义即「该 stage 已被 QA 触发重做的次数」。
    const retryTargetStage = task.stages.find((stage) => stage.name === retryTargetStageName);
    const attempts = retryTargetStage?.attempts ?? 0;

    // 输出缺失/异常：标 QA 阶段失败并抛错，让 taskRunner 把任务标 failed，避免静默吞掉。
    if (!result) {
      await taskRepository.markStageFailed(state._id, qaStageName, 'qa_output_missing');
      throw new Error('qa_output_missing');
    }

    if (result.decision === 'pass') {
      return 'pass';
    }

    // 重试次数耗尽：熔断 —— 标 QA 阶段失败并抛错，最终任务落 failed。
    if (attempts >= MAX_QA_ATTEMPTS) {
      await taskRepository.markStageFailed(state._id, qaStageName, 'qa_attempts_exhausted');
      throw new Error('qa_attempts_exhausted');
    }

    // 注意顺序：先累加 attempts，再 reset。reset 只重置 status/output，不会清掉 attempts。
    await taskRepository.incrementStageAttempts(state._id, retryTargetStageName);
    await taskRepository.resetStagesFrom(state._id, resetStageNames);
    return 'fail';
  };
}

