export type TaskStageName =
  | 'script_generating'
  | 'storyboard_generating'
  | 'image_generating'
  | 'video_generating'
  | 'editing'
  | 'qa_reviewing';

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';
export type TaskStageStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AssetResource {
  id: string;
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
  videoPrompt: string;
}

export interface TaskStage {
  name: TaskStageName;
  status: TaskStageStatus;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
}

export interface TaskStageOutputDocument {
  stageName: TaskStageName;
  version: 'v1';
  generatedAt: string;
  input: Record<string, unknown>;
  summary: Array<{ label: string; value: string }>;
  metrics: Array<{ label: string; value: string | number }>;
  result: unknown;
}

export interface Task {
  id: string;
  name: string;
  brief: TaskBrief;
  status: TaskStatus;
  currentStage: TaskStageName | null;
  stages: TaskStage[];
  outputs: Partial<Record<TaskStageName, TaskStageOutputDocument>>;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRepository {
  list(): Task[];
  findById(taskId: string): Task | null;
  save(task: Task): Task;
}

export interface AssetRepository {
  list(): AssetResource[];
  saveMany(assets: AssetResource[]): AssetResource[];
}
