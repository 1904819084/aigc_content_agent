import { TaskStageName, TaskType } from '../enums';
import type { SharedTaskDefinition } from './types';

export const shortVideoTaskDefinition: SharedTaskDefinition = {
  taskType: TaskType.ShortVideo,
  stages: [
    { name: TaskStageName.ScriptGenerating, label: '短视频剧本生成' },
    { name: TaskStageName.StoryboardGenerating, label: '分镜脚本生成' },
    { name: TaskStageName.ImagePromptGenerating, label: '分镜图提示词生成' },
    { name: TaskStageName.ImageGenerating, label: '分镜图生成' },
    { name: TaskStageName.ImageQaReviewing, label: '分镜图质检' },
    { name: TaskStageName.VideoPromptGenerating, label: '分镜视频提示词生成' },
    { name: TaskStageName.VideoGenerating, label: '分镜视频生成' },
    { name: TaskStageName.VideoQaReviewing, label: '分镜视频质检' },
    { name: TaskStageName.Editing, label: '分镜视频混剪成片' },
    { name: TaskStageName.EditingQaReviewing, label: '短视频最终成片质检' },
  ],
};
