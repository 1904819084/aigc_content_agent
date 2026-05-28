import type { TaskStageName, TaskType } from '../enums';
import { imageTextTaskDefinition } from './imageTextTaskDefinition';
import { shortVideoTaskDefinition } from './shortVideoTaskDefinition';
import type { SharedStageDefinition, SharedTaskDefinition } from './types';

export type { SharedStageDefinition, SharedTaskDefinition } from './types';

const SHARED_TASK_DEFINITION_BY_TYPE: Record<TaskType, SharedTaskDefinition> = {
  short_video: shortVideoTaskDefinition,
  image_text: imageTextTaskDefinition,
};

export function getSharedTaskDefinition(taskType: TaskType): SharedTaskDefinition {
  return SHARED_TASK_DEFINITION_BY_TYPE[taskType];
}

export function getSharedTaskStageNames(taskType: TaskType): TaskStageName[] {
  return getSharedTaskDefinition(taskType).stages.map((stage) => stage.name);
}

export function findSharedTaskStageDefinition(
  taskType: TaskType,
  stageName: TaskStageName,
): SharedStageDefinition | undefined {
  return getSharedTaskDefinition(taskType).stages.find((stage) => stage.name === stageName);
}
