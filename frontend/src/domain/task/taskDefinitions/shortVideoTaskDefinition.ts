import { TaskStageName, TaskType } from '../../../constants/task';
import type { FrontendTaskDefinition } from './types';

export const shortVideoTaskDefinition: FrontendTaskDefinition = {
  taskType: TaskType.ShortVideo,
  stages: [
    { name: TaskStageName.ScriptGenerating, label: '短视频剧本生成', layout: { col: 0, row: 0 } },
    { name: TaskStageName.StoryboardGenerating, label: '分镜脚本生成', layout: { col: 1, row: 0 } },
    { name: TaskStageName.ImagePromptGenerating, label: '分镜图提示词生成', layout: { col: 2, row: 0 } },
    { name: TaskStageName.ImageGenerating, label: '分镜图生成', layout: { col: 3, row: 0 } },
    { name: TaskStageName.ImageQaReviewing, label: '分镜图质检', layout: { col: 4, row: 0 } },
    // 第二行：分镜视频链路。VideoPromptGenerating 与 ImagePromptGenerating 同列，体现并发分叉。
    { name: TaskStageName.VideoPromptGenerating, label: '分镜视频提示词生成', layout: { col: 2, row: 1 } },
    { name: TaskStageName.VideoGenerating, label: '分镜视频生成', layout: { col: 5, row: 1 } },
    { name: TaskStageName.VideoQaReviewing, label: '分镜视频质检', layout: { col: 6, row: 1 } },
    { name: TaskStageName.Editing, label: '分镜视频混剪成片', layout: { col: 7, row: 0 } },
    { name: TaskStageName.EditingQaReviewing, label: '短视频最终成片质检', layout: { col: 8, row: 0 } },
  ],
  dependencies: [
    [TaskStageName.ScriptGenerating, TaskStageName.StoryboardGenerating],
    [TaskStageName.StoryboardGenerating, TaskStageName.ImagePromptGenerating],
    [TaskStageName.StoryboardGenerating, TaskStageName.VideoPromptGenerating],
    [TaskStageName.ImagePromptGenerating, TaskStageName.ImageGenerating],
    [TaskStageName.ImageGenerating, TaskStageName.ImageQaReviewing],
    // VideoGenerating 等待 image_qa pass + video_prompt 都完成（后端通过 Sink 节点保证 AND-join）。
    [TaskStageName.ImageQaReviewing, TaskStageName.VideoGenerating],
    [TaskStageName.VideoPromptGenerating, TaskStageName.VideoGenerating],
    [TaskStageName.VideoGenerating, TaskStageName.VideoQaReviewing],
    [TaskStageName.VideoQaReviewing, TaskStageName.Editing],
    [TaskStageName.Editing, TaskStageName.EditingQaReviewing],
  ],
};
