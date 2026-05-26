import type { TaskStageName, TaskStageStatus, TaskStatus, TaskType } from './constants/task';

export interface AssetResource {
  _id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface TaskBrief {
  productName: string;
  productImages: AssetResource[];
  inputPrompt: string;
  taskType: TaskType;
}

export interface TaskStage {
  name: TaskStageName;
  status: TaskStageStatus;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  // QA 失败回溯重试次数（仅 *_qa_reviewing 阶段会累加）
  attempts: number;
}

export interface TaskStageOutput {
  stageName: TaskStageName;
  version: 'v1';
  generatedAt: string;
  input: Record<string, unknown>;
  output: unknown;
}

export interface Task {
  _id: string;
  name: string;
  brief: TaskBrief;
  status: TaskStatus;
  currentStage: TaskStageName | null;
  stages: TaskStage[];
  outputs: Partial<Record<TaskStageName, TaskStageOutput>>;
  createdAt: string;
  updatedAt: string;
}
