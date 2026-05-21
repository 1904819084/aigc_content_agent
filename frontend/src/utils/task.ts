import {
  TASK_STAGE_LABELS,
  TASK_STAGE_STATUS_LABELS,
  TASK_STATUS_LABELS,
  TaskStageName,
  TaskStageStatus,
  TaskStatus,
} from '../constants/task';
import type { Task, TaskStage } from '../types';

export function getTaskStageLabel(stageName: TaskStageName) {
  return TASK_STAGE_LABELS[stageName] ?? stageName;
}

export function getTaskStatusLabel(status: TaskStatus) {
  return TASK_STATUS_LABELS[status] ?? status;
}

export function getTaskStageStatusLabel(status: TaskStageStatus) {
  return TASK_STAGE_STATUS_LABELS[status] ?? status;
}

export function getTaskCurrentStageLabel(task: Task) {
  if (task.currentStage) {
    return getTaskStageLabel(task.currentStage);
  }

  if (task.status === TaskStatus.Completed) {
    return '已完成';
  }

  if (task.status === TaskStatus.Failed) {
    return '执行失败';
  }

  return '待处理';
}

export function stringifyTaskOutput(value: unknown) {
  return JSON.stringify(value, null, 2) ?? 'null';
}

export function formatTaskTimestamp(value: string | null | undefined) {
  if (!value) {
    return '--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function getTaskStageOutput(task: Task, stage: TaskStage) {
  return task.outputs[stage.name] ?? null;
}

export function isTaskTerminalStatus(status: TaskStatus) {
  return status === TaskStatus.Completed || status === TaskStatus.Failed;
}

export function isTaskRunningStatus(status: TaskStatus) {
  return status === TaskStatus.Running;
}

export function getCurrentTaskStageIndex(task: Task) {
  const runningIndex = task.stages.findIndex((stage) => stage.status === TaskStageStatus.Running);

  if (runningIndex >= 0) {
    return runningIndex;
  }

  let lastCompletedIndex = -1;
  task.stages.forEach((stage, index) => {
    if (stage.status === TaskStageStatus.Completed) {
      lastCompletedIndex = index;
    }
  });

  return Math.max(lastCompletedIndex, 0);
}

export function hasTaskStageOutput(task: Task, stage: TaskStage) {
  return Boolean(getTaskStageOutput(task, stage));
}
