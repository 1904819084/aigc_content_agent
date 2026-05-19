export type TaskStageName =
  | 'script_generating'
  | 'storyboard_generating'
  | 'image_prompt_generating'
  | 'image_generating'
  | 'video_prompt_generating'
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

export interface ScriptSection {
  heading: string;
  narration: string;
}

// 剧本生成结果类型
export interface ScriptResult {
  title: string;
  hook: string;
  positioning: string;
  sections: ScriptSection[];
  cta: string;
}

// 分镜脚本生成结果类型
export interface StoryboardShotResult {
  shotId: string;
  duration: number;
  shotType: string;
  visual: string;
  narration: string;
  subtitle: string;
  cameraMotion: string;
}

// 分镜图Prompt生成结果类型
export interface ImagePromptGeneratingResult {
  shotId: string;
  imagePrompt: string;
}

// 分镜图生成结果类型
export interface ImageGeneratingResult {
  shotId: string;
  image: string;
}

// 分镜视频Prompt生成结果类型
export interface VideoPromptGeneratingResult {
  shotId: string;
  videoPrompt: string;
}

// 分镜视频生成结果类型
export interface VideoGeneratingResult {
  shotId: string;
  video: string;
  duration: number;
}

export interface TaskStage {
  name: TaskStageName;
  status: TaskStageStatus;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
}

export interface TaskStageOutput {
  stageName: TaskStageName;
  version: 'v1';
  generatedAt: string;
  input: Record<string, unknown>;
  output: unknown;
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

export interface TaskRepository {
  list(): Task[];
  findById(taskId: string): Task | null;
  save(task: Task): Task;
}

export interface AssetRepository {
  list(): AssetResource[];
  saveMany(assets: AssetResource[]): AssetResource[];
}
