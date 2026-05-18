import type { TaskStageName, TaskStageStatus, TaskStatus } from './constants/task';

export interface AssetResource {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface TaskBrief {
  productName: string;
  productImages: AssetResource[];
  videoPrompt: string;
}

export interface TaskStage {
  name: TaskStageName;
  status: TaskStageStatus;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
}

export interface TaskStageOutputMetric {
  label: string;
  value: string | number;
}

export interface TaskStageOutputSummaryItem {
  label: string;
  value: string;
}

export interface TaskStageOutput {
  stageName: TaskStageName;
  version: 'v1';
  generatedAt: string;
  input: Record<string, string | number | boolean>;
  summary: TaskStageOutputSummaryItem[];
  metrics: TaskStageOutputMetric[];
  result: unknown;
}

export interface Task {
  id: string;
  name: string;
  brief: TaskBrief;
  status: TaskStatus;
  currentStage: TaskStageName | null;
  stages: TaskStage[];
  outputs: Partial<Record<TaskStageName, TaskStageOutput>>;
  createdAt: string;
  updatedAt: string;
}
