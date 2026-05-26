import type { Task, TaskBrief } from '../../types';
import { createInitialTaskStages } from './taskPipeline';

export function createTaskEntity(brief: TaskBrief): Task {
  const timestamp = Date.now();

  return {
    _id: `task_${timestamp}`,
    name: brief.productName,
    brief,
    status: 'pending',
    currentStage: null,
    stages: createInitialTaskStages(brief.taskType),
    outputs: {},
    createdAt: new Date(timestamp).toISOString(),
    updatedAt: new Date(timestamp).toISOString(),
  };
}

export function resetTaskForRun(task: Task): Task {
  return {
    ...task,
    status: 'pending',
    currentStage: null,
    outputs: {},
    stages: createInitialTaskStages(task.brief.taskType),
  };
}
