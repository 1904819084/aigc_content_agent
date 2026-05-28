import { TaskStageName, TaskType } from '../../../constants/task';
import type { FrontendTaskDefinition } from './types';

export const imageTextTaskDefinition: FrontendTaskDefinition = {
  taskType: TaskType.ImageText,
  stages: [
    { name: TaskStageName.ScriptGenerating, label: '图文剧本生成', layout: { col: 0, row: 0 } },
    { name: TaskStageName.ImagePromptGenerating, label: '图文生图提示词生成', layout: { col: 1, row: 0 } },
    { name: TaskStageName.ImageGenerating, label: '图文生成', layout: { col: 2, row: 0 } },
    { name: TaskStageName.ImageQaReviewing, label: '图文质检', layout: { col: 3, row: 0 } },
  ],
  dependencies: [
    [TaskStageName.ScriptGenerating, TaskStageName.ImagePromptGenerating],
    [TaskStageName.ImagePromptGenerating, TaskStageName.ImageGenerating],
    [TaskStageName.ImageGenerating, TaskStageName.ImageQaReviewing],
  ],
};
