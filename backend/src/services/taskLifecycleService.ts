import type { Task, TaskBrief, TaskStage, TaskStageName, TaskStatus, TaskType } from '../types';
import { getSharedTaskDefinition } from '@aigc/shared';

export function createInitialTaskStages(taskType: TaskType = 'short_video'): TaskStage[] {
  return getSharedTaskDefinition(taskType).stages.map((stage) => ({
    name: stage.name,
    status: 'pending',
    startedAt: null,
    finishedAt: null,
    error: null,
    attempts: 0,
  }));
}

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

export function updateTaskStage(
  task: Task,
  stageName: TaskStageName,
  updates: Partial<Pick<TaskStage, 'status' | 'startedAt' | 'finishedAt' | 'error'>>,
): Task {
  return {
    ...task,
    stages: task.stages.map((stage) => {
      if (stage.name !== stageName) {
        return stage;
      }

      return {
        ...stage,
        ...updates,
      };
    }),
  };
}

export function updateTaskStatus(
  task: Task,
  status: TaskStatus,
  currentStage: TaskStageName | null = null,
): Task {
  return {
    ...task,
    status,
    currentStage,
  };
}
