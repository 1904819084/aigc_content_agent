import { updateTaskStage, updateTaskStatus } from '../../domain/task/taskPipeline';
import { createStageOutput } from '../../utils/createStageOutput';

function setStageRunning(taskRepository, taskId, stageName) {
  const task = taskRepository.findById(taskId);

  if (!task) {
    throw new Error('task_not_found');
  }

  const runningTask = taskRepository.save(updateTaskStatus(task, 'running', stageName));
  taskRepository.save(
    updateTaskStage(runningTask, stageName, {
      status: 'running',
      startedAt: new Date().toISOString(),
      finishedAt: null,
      error: null,
    }),
  );
}

function setStageCompleted(taskRepository, taskId, stageName, outputData) {
  const task = taskRepository.findById(taskId);

  if (!task) {
    throw new Error('task_not_found');
  }

  const output = createStageOutput(stageName, outputData);
  const finishedTask = taskRepository.save(
    updateTaskStage(task, stageName, {
      status: 'completed',
      finishedAt: new Date().toISOString(),
      error: null,
    }),
  );

  taskRepository.save({
    ...finishedTask,
    outputs: {
      ...finishedTask.outputs,
      [stageName]: output,
    },
  });
}

function setStageFailed(taskRepository, taskId, stageName, error) {
  const task = taskRepository.findById(taskId);

  if (!task) {
    return;
  }

  const stageFailedTask = taskRepository.save(
    updateTaskStage(task, stageName, {
      status: 'failed',
      finishedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'unknown_error',
    }),
  );

  taskRepository.save(updateTaskStatus(stageFailedTask, 'failed', stageName));
}

export function createRunStageNode(taskRepository, stageName, stageAgent) {
  return async (state) => {
    const taskId = state.taskId;

    try {
      setStageRunning(taskRepository, taskId, stageName);
      const task = taskRepository.findById(taskId);

      if (!task) {
        throw new Error('task_not_found');
      }

      if (!stageAgent) {
        throw new Error('stage_agent_missing');
      }

      const outputData = await stageAgent(task);
      setStageCompleted(taskRepository, taskId, stageName, outputData);

      return {
        currentStage: stageName,
        error: null,
      };
    } catch (error) {
      setStageFailed(taskRepository, taskId, stageName, error);
      throw error instanceof Error ? error : new Error('unknown_error');
    }
  };
}
