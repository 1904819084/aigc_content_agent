import type { Task, TaskStage, TaskStageName, TaskStatus, TaskType } from '../../types';
import { getTaskDefinition, getTaskStageNames } from './taskDefinitions';

// 单一事实源：通过 taskDefinition 派生阶段名列表，避免与 graph/前端各自维护一份。
export const SHORT_VIDEO_STAGE_NAMES: TaskStageName[] = getTaskStageNames('short_video');
export const IMAGE_TEXT_STAGE_NAMES: TaskStageName[] = getTaskStageNames('image_text');


export function createInitialTaskStages(taskType: TaskType = 'short_video'): TaskStage[] {
  return getTaskDefinition(taskType).stages.map((stage) => ({
    name: stage.name,
    status: 'pending',
    startedAt: null,
    finishedAt: null,
    error: null,
    attempts: 0,
  }));
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
