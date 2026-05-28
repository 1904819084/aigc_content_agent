import { TaskStageName, TaskType } from '../../../constants/task';
import { imageTextTaskDefinition } from './imageTextTaskDefinition';
import { shortVideoTaskDefinition } from './shortVideoTaskDefinition';
import type { FrontendStageDefinition, FrontendTaskDefinition } from './types';

export type { FrontendStageDefinition, FrontendTaskDefinition } from './types';
export { gridToStageLayout } from './types';

const TASK_DEFINITION_BY_TYPE: Record<TaskType, FrontendTaskDefinition> = {
  [TaskType.ShortVideo]: shortVideoTaskDefinition,
  [TaskType.ImageText]: imageTextTaskDefinition,
};

export function getTaskDefinition(taskType: TaskType): FrontendTaskDefinition {
  return TASK_DEFINITION_BY_TYPE[taskType] ?? shortVideoTaskDefinition;
}

export function findStageDefinition(
  taskType: TaskType,
  stageName: TaskStageName,
): FrontendStageDefinition | undefined {
  return getTaskDefinition(taskType).stages.find((stage) => stage.name === stageName);
}
