import type { Task, TaskRepository, TaskStageName } from '../../types';
import { updateTaskStage, updateTaskStatus } from '../../domain/task/taskPipeline';
import { createStageOutput } from '../../utils/createStageOutput';

type TaskGraphState = {
  taskId: string;
  currentStage: TaskStageName | null;
  error: string | null;
};

type StageAgent = (task: Task) => Promise<{
  input: Record<string, unknown>;
  output: unknown;
}>;

async function setStageRunning(taskRepository: TaskRepository, taskId: string, stageName: TaskStageName) {
  const task = await taskRepository.findById(taskId);

  if (!task) {
    throw new Error('task_not_found');
  }

  const runningTask = await taskRepository.save(updateTaskStatus(task, 'running', stageName));
  await taskRepository.save(
    updateTaskStage(runningTask, stageName, {
      status: 'running',
      startedAt: new Date().toISOString(),
      finishedAt: null,
      error: null,
    }),
  );
}

async function setStageCompleted(
  taskRepository: TaskRepository,
  taskId: string,
  stageName: TaskStageName,
  outputData: Awaited<ReturnType<StageAgent>>,
) {
  const task = await taskRepository.findById(taskId);

  if (!task) {
    throw new Error('task_not_found');
  }

  const output = createStageOutput(stageName, outputData);
  const finishedTask = await taskRepository.save(
    updateTaskStage(task, stageName, {
      status: 'completed',
      finishedAt: new Date().toISOString(),
      error: null,
    }),
  );

  await taskRepository.save({
    ...finishedTask,
    outputs: {
      ...finishedTask.outputs,
      [stageName]: output,
    },
  });
}

async function setStageFailed(
  taskRepository: TaskRepository,
  taskId: string,
  stageName: TaskStageName,
  error: unknown,
) {
  const task = await taskRepository.findById(taskId);

  if (!task) {
    return;
  }

  const stageFailedTask = await taskRepository.save(
    updateTaskStage(task, stageName, {
      status: 'failed',
      finishedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'unknown_error',
    }),
  );

  await taskRepository.save(updateTaskStatus(stageFailedTask, 'failed', stageName));
}

export function createRunStageNode(
  taskRepository: TaskRepository,
  stageName: TaskStageName,
  stageAgent: StageAgent,
) {
  return async (state: TaskGraphState) => {
    const taskId = state.taskId;

    try {
      await setStageRunning(taskRepository, taskId, stageName);
      const task = await taskRepository.findById(taskId);

      if (!task) {
        throw new Error('task_not_found');
      }

      if (!stageAgent) {
        throw new Error('stage_agent_missing');
      }

      const outputData = await stageAgent(task);
      await setStageCompleted(taskRepository, taskId, stageName, outputData);

      return {
        currentStage: stageName,
        error: null,
      };
    } catch (error) {
      await setStageFailed(taskRepository, taskId, stageName, error);
      throw error instanceof Error ? error : new Error('unknown_error');
    }
  };
}
