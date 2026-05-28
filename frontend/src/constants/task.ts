/**
 * 前端任务相关枚举与展示文案：
 * - 枚举值（TaskType / TaskStageName / TaskStatus / TaskStageStatus）从 @aigc/shared re-export，
 *   保证与后端 100% 同步。`as const` 形态保留 `TaskStageName.ScriptGenerating` 风格的访问，
 *   组件层调用方式与原 enum 一致。
 * - 展示文案/颜色映射等纯前端关心的内容继续留在本文件。
 */
import { TaskStageName, TaskStageStatus, TaskStatus, TaskType } from '@aigc/shared';

export { TaskStageName, TaskStageStatus, TaskStatus, TaskType };

export const TASK_STAGE_LABELS: Record<TaskStageName, string> = {
  [TaskStageName.ScriptGenerating]: '短视频剧本生成',
  [TaskStageName.StoryboardGenerating]: '分镜脚本生成',
  [TaskStageName.ImagePromptGenerating]: '分镜图提示词生成',
  [TaskStageName.ImageGenerating]: '分镜图生成',
  [TaskStageName.ImageQaReviewing]: '分镜图质检',
  [TaskStageName.VideoPromptGenerating]: '分镜视频提示词生成',
  [TaskStageName.VideoGenerating]: '分镜视频生成',
  [TaskStageName.VideoQaReviewing]: '分镜视频质检',
  [TaskStageName.Editing]: '分镜视频混剪成片',
  [TaskStageName.EditingQaReviewing]: '短视频最终成片质检',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: '未开始',
  [TaskStatus.Running]: '执行中',
  [TaskStatus.Completed]: '已完成',
  [TaskStatus.Failed]: '执行失败',
};

export const TASK_STAGE_STATUS_LABELS: Record<TaskStageStatus, string> = {
  [TaskStageStatus.Pending]: '未开始',
  [TaskStageStatus.Running]: '执行中',
  [TaskStageStatus.Completed]: '已完成',
  [TaskStageStatus.Failed]: '执行失败',
};

export const TASK_STAGE_STEP_STATUS_MAP: Record<
  TaskStageStatus,
  'wait' | 'process' | 'finish' | 'error'
> = {
  [TaskStageStatus.Pending]: 'wait',
  [TaskStageStatus.Running]: 'process',
  [TaskStageStatus.Completed]: 'finish',
  [TaskStageStatus.Failed]: 'error',
};

export const TASK_STAGE_TAG_COLOR_MAP: Record<
  TaskStageStatus,
  'default' | 'warning' | 'success' | 'error'
> = {
  [TaskStageStatus.Pending]: 'default',
  [TaskStageStatus.Running]: 'warning',
  [TaskStageStatus.Completed]: 'success',
  [TaskStageStatus.Failed]: 'error',
};

export const TASK_STATUS_TAG_COLOR_MAP: Record<
  TaskStatus,
  'default' | 'warning' | 'success' | 'error'
> = {
  [TaskStatus.Pending]: 'default',
  [TaskStatus.Running]: 'warning',
  [TaskStatus.Completed]: 'success',
  [TaskStatus.Failed]: 'error',
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  [TaskType.ShortVideo]: '短视频',
  [TaskType.ImageText]: '图文',
};

export function createDefaultTaskBrief() {
  return {
    productName: '',
    productImages: [],
    inputPrompt: '',
    taskType: TaskType.ShortVideo,
  };
}
