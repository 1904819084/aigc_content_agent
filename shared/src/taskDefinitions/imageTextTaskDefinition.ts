import { TaskStageName, TaskType } from '../enums';
import type { SharedTaskDefinition } from './types';

export const imageTextTaskDefinition: SharedTaskDefinition = {
  taskType: TaskType.ImageText,
  stages: [
    { name: TaskStageName.ScriptGenerating, label: '图文剧本生成' },
    { name: TaskStageName.ImagePromptGenerating, label: '图文生图提示词生成' },
    { name: TaskStageName.ImageGenerating, label: '图文生成' },
    { name: TaskStageName.ImageQaReviewing, label: '图文质检' },
  ],
};
