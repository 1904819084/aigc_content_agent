export enum TaskStageName {
  ScriptGenerating = 'script_generating',
  StoryboardGenerating = 'storyboard_generating',
  ImageGenerating = 'image_generating',
  VideoGenerating = 'video_generating',
  Editing = 'editing',
  QaReviewing = 'qa_reviewing',
}

export enum TaskStageStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
}

export enum TaskStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
}

export const TASK_STAGE_LABELS: Record<TaskStageName, string> = {
  [TaskStageName.ScriptGenerating]: '剧本生成',
  [TaskStageName.StoryboardGenerating]: '分镜脚本生成',
  [TaskStageName.ImageGenerating]: '分镜图生成',
  [TaskStageName.VideoGenerating]: '分镜视频生成',
  [TaskStageName.Editing]: '视频混剪',
  [TaskStageName.QaReviewing]: '质检审阅',
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
  'default' | 'processing' | 'success' | 'error'
> = {
  [TaskStageStatus.Pending]: 'default',
  [TaskStageStatus.Running]: 'default',
  [TaskStageStatus.Completed]: 'success',
  [TaskStageStatus.Failed]: 'error',
};

export const TASK_STATUS_TAG_COLOR_MAP: Record<
  TaskStatus,
  'default' | 'processing' | 'success' | 'error'
> = {
  [TaskStatus.Pending]: 'default',
  [TaskStatus.Running]: 'default',
  [TaskStatus.Completed]: 'success',
  [TaskStatus.Failed]: 'error',
};

export function createDefaultTaskBrief() {
  return {
    productName: '',
    productImages: [],
    videoPrompt: '',
  };
}
