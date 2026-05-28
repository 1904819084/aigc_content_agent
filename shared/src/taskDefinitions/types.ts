import type { TaskStageName, TaskType } from '../enums';

export interface SharedStageDefinition {
  name: TaskStageName;
  label: string;
}

export interface SharedTaskDefinition {
  taskType: TaskType;
  stages: SharedStageDefinition[];
}
