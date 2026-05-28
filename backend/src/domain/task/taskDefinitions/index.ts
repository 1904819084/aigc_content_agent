import type { TaskStageName, TaskType } from '../../../types';
import { imageTextTaskDefinition } from './imageTextTaskDefinition';
import { shortVideoTaskDefinition } from './shortVideoTaskDefinition';
import type { StageDefinition, TaskDefinition } from './types';

export type { StageDefinition, TaskDefinition } from './types';

const TASK_DEFINITION_BY_TYPE: Record<TaskType, TaskDefinition> = {
  short_video: shortVideoTaskDefinition,
  image_text: imageTextTaskDefinition,
};

export function getTaskDefinition(taskType: TaskType): TaskDefinition {
  return TASK_DEFINITION_BY_TYPE[taskType];
}

export function getTaskStageNames(taskType: TaskType): TaskStageName[] {
  return getTaskDefinition(taskType).stages.map((stage) => stage.name);
}

export function findStageDefinition(
  taskType: TaskType,
  stageName: TaskStageName,
): StageDefinition | undefined {
  return getTaskDefinition(taskType).stages.find((stage) => stage.name === stageName);
}
