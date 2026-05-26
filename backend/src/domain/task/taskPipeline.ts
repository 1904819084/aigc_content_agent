import type { Task, TaskStage, TaskStageName, TaskStatus, TaskType } from '../../types';

// 短视频任务全链路阶段。
export const SHORT_VIDEO_STAGE_NAMES: TaskStageName[] = [
  'script_generating',
  'storyboard_generating',
  'image_prompt_generating',
  'image_generating',
  'image_qa_reviewing',
  'video_prompt_generating',
  'video_generating',
  'video_qa_reviewing',
  'editing',
  'editing_qa_reviewing',
];

// 图文任务全链路阶段。
export const IMAGE_TEXT_STAGE_NAMES: TaskStageName[] = [
  'script_generating',
  'image_prompt_generating',
  'image_generating',
  'image_qa_reviewing',
];

//默认导出按短视频链路返回。
export const TASK_STAGE_NAMES: TaskStageName[] = SHORT_VIDEO_STAGE_NAMES;

export function getTaskStageNames(taskType: TaskType): TaskStageName[] {
  return taskType === 'image_text' ? IMAGE_TEXT_STAGE_NAMES : SHORT_VIDEO_STAGE_NAMES;
}

export function createInitialTaskStages(taskType: TaskType = 'short_video'): TaskStage[] {
  return getTaskStageNames(taskType).map((name) => ({
    name,
    status: 'pending',
    startedAt: null,
    finishedAt: null,
    error: null,
    attempts: 0,
  }));
}

export function updateTaskStage(
  task: Task,
  stageName: TaskStageName,
  updates: Partial<Pick<TaskStage, 'status' | 'startedAt' | 'finishedAt' | 'error'>>,
): Task {
  return {
    ...task,
    stages: task.stages.map((stage) => {
      if (stage.name !== stageName) {
        return stage;
      }

      return {
        ...stage,
        ...updates,
      };
    }),
  };
}

export function updateTaskStatus(
  task: Task,
  status: TaskStatus,
  currentStage: TaskStageName | null = null,
): Task {
  return {
    ...task,
    status,
    currentStage,
  };
}
