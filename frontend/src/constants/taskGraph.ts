import { TaskStageName, TaskType } from './task';

export type TaskStageGridLayout = {
  col: number;
  row: number;
};

export type FrontendTaskGraphDefinition = {
  taskType: TaskType;
  stageLayouts: Partial<Record<TaskStageName, TaskStageGridLayout>>;
  dependencies: Array<[TaskStageName, TaskStageName]>;
};

const shortVideoTaskGraphDefinition: FrontendTaskGraphDefinition = {
  taskType: TaskType.ShortVideo,
  stageLayouts: {
    [TaskStageName.ScriptGenerating]: { col: 0, row: 0 },
    [TaskStageName.StoryboardGenerating]: { col: 1, row: 0 },
    [TaskStageName.ImagePromptGenerating]: { col: 2, row: 0 },
    [TaskStageName.ImageGenerating]: { col: 3, row: 0 },
    [TaskStageName.ImageQaReviewing]: { col: 4, row: 0 },
    [TaskStageName.VideoPromptGenerating]: { col: 2, row: 1 },
    [TaskStageName.VideoGenerating]: { col: 5, row: 1 },
    [TaskStageName.VideoQaReviewing]: { col: 6, row: 1 },
    [TaskStageName.Editing]: { col: 7, row: 0 },
    [TaskStageName.EditingQaReviewing]: { col: 8, row: 0 },
  },
  dependencies: [
    [TaskStageName.ScriptGenerating, TaskStageName.StoryboardGenerating],
    [TaskStageName.StoryboardGenerating, TaskStageName.ImagePromptGenerating],
    [TaskStageName.StoryboardGenerating, TaskStageName.VideoPromptGenerating],
    [TaskStageName.ImagePromptGenerating, TaskStageName.ImageGenerating],
    [TaskStageName.ImageGenerating, TaskStageName.ImageQaReviewing],
    [TaskStageName.ImageQaReviewing, TaskStageName.VideoGenerating],
    [TaskStageName.VideoPromptGenerating, TaskStageName.VideoGenerating],
    [TaskStageName.VideoGenerating, TaskStageName.VideoQaReviewing],
    [TaskStageName.VideoQaReviewing, TaskStageName.Editing],
    [TaskStageName.Editing, TaskStageName.EditingQaReviewing],
  ],
};

const imageTextTaskGraphDefinition: FrontendTaskGraphDefinition = {
  taskType: TaskType.ImageText,
  stageLayouts: {
    [TaskStageName.ScriptGenerating]: { col: 0, row: 0 },
    [TaskStageName.ImagePromptGenerating]: { col: 1, row: 0 },
    [TaskStageName.ImageGenerating]: { col: 2, row: 0 },
    [TaskStageName.ImageQaReviewing]: { col: 3, row: 0 },
  },
  dependencies: [
    [TaskStageName.ScriptGenerating, TaskStageName.ImagePromptGenerating],
    [TaskStageName.ImagePromptGenerating, TaskStageName.ImageGenerating],
    [TaskStageName.ImageGenerating, TaskStageName.ImageQaReviewing],
  ],
};

const TASK_GRAPH_DEFINITION_BY_TYPE: Record<TaskType, FrontendTaskGraphDefinition> = {
  [TaskType.ShortVideo]: shortVideoTaskGraphDefinition,
  [TaskType.ImageText]: imageTextTaskGraphDefinition,
};

export function getTaskGraphDefinition(taskType: TaskType): FrontendTaskGraphDefinition {
  return TASK_GRAPH_DEFINITION_BY_TYPE[taskType] ?? shortVideoTaskGraphDefinition;
}
