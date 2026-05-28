/**
 * 前后端共享的枚举：用 const object + 同名 type 形态实现，
 * 既保留前端 `TaskStageName.ScriptGenerating` 风格的访问，又与后端 string union 等价。
 *
 * 不用 TS enum：会编译出反向映射对象，bundle 多余；且与后端 string literal 不互通。
 */

export const TaskType = {
  ShortVideo: 'short_video',
  ImageText: 'image_text',
} as const;
export type TaskType = (typeof TaskType)[keyof typeof TaskType];

export const TaskStageName = {
  ScriptGenerating: 'script_generating',
  StoryboardGenerating: 'storyboard_generating',
  ImagePromptGenerating: 'image_prompt_generating',
  ImageGenerating: 'image_generating',
  ImageQaReviewing: 'image_qa_reviewing',
  VideoPromptGenerating: 'video_prompt_generating',
  VideoGenerating: 'video_generating',
  VideoQaReviewing: 'video_qa_reviewing',
  Editing: 'editing',
  EditingQaReviewing: 'editing_qa_reviewing',
} as const;
export type TaskStageName = (typeof TaskStageName)[keyof typeof TaskStageName];

export const TaskStatus = {
  Pending: 'pending',
  Running: 'running',
  Completed: 'completed',
  Failed: 'failed',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskStageStatus = {
  Pending: 'pending',
  Running: 'running',
  Completed: 'completed',
  Failed: 'failed',
} as const;
export type TaskStageStatus = (typeof TaskStageStatus)[keyof typeof TaskStageStatus];
