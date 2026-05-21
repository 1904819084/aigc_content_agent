import type { Task, TaskRepository, TaskStageName } from '../../types';
import { createStageOutput } from '../../utils/createStageOutput';

type TaskGraphState = {
  _id: string;
};

type StageAgent = (task: Task) => Promise<{
  input: Record<string, unknown>;
  output: unknown;
}>;

async function setStageRunning(taskRepository: TaskRepository, _id: string, stageName: TaskStageName) {
  const task = await taskRepository.markStageRunning(_id, stageName);

  if (!task) {
    throw new Error('task_not_found');
  }
}

async function setStageCompleted(
  taskRepository: TaskRepository,
  _id: string,
  stageName: TaskStageName,
  outputData: Awaited<ReturnType<StageAgent>>,
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

export function createRunStageNode(
  taskRepository: TaskRepository,
  stageName: TaskStageName,
  stageAgent: StageAgent,
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
