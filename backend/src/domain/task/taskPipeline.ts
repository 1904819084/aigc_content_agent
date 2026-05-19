import type { Task, TaskStage, TaskStageName, TaskStatus } from '../../types';

export const TASK_STAGE_NAMES: TaskStageName[] = [
  'script_generating',
  'storyboard_generating',
  'image_prompt_generating',
  'image_generating',
  'video_generating',
  'editing',
  'qa_reviewing',
];

export function createInitialTaskStages(): TaskStage[] {
  return TASK_STAGE_NAMES.map((name) => ({
    name,
    status: 'pending',
    startedAt: null,
    finishedAt: null,
    error: null,
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
