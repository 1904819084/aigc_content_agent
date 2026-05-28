import type { TaskStageName, TaskStageStatus, TaskStatus, TaskType } from './enums';
import type { StageOutputMap } from './stageResults';

export interface AssetResource {
  _id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface UploadedAssetFile {
  originalname: string;
  mimetype: string;
  size: number;
  filename: string;
}

export interface TaskBrief {
  productName: string;
  productImages: AssetResource[];
  inputPrompt: string;
  taskType: TaskType;
}

export interface TaskListQuery {
  _id?: string;
  productName?: string;
  startDate?: string;
  endDate?: string;
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

/**
 * 阶段输出快照。`S` 为具体的 stageName 时 output 收紧到 StageOutputMap[S]，
 * 不带泛型时退化为 unknown，兼容序列化/跨任意 stage 的工具方法。
 */
export interface TaskStageOutput<S extends TaskStageName = TaskStageName> {
  stageName: S;
  generatedAt: string;
  input: Record<string, unknown>;
  output: S extends keyof StageOutputMap ? StageOutputMap[S] : unknown;
}

export interface Task {
  _id: string;
  name: string;
  brief: TaskBrief;
  status: TaskStatus;
  currentStage: TaskStageName | null;
  stages: TaskStage[];
  outputs: Partial<{ [S in TaskStageName]: TaskStageOutput<S> }>;
  createdAt: string;
  updatedAt: string;
}
