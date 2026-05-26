export type TaskType = 'short_video' | 'image_text';

export type TaskStageName =
  | 'script_generating'
  | 'storyboard_generating'
  | 'image_prompt_generating'
  | 'image_generating'
  | 'image_qa_reviewing'
  | 'video_prompt_generating'
  | 'video_generating'
  | 'video_qa_reviewing'
  | 'editing'
  | 'editing_qa_reviewing';

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';
export type TaskStageStatus = 'pending' | 'running' | 'completed' | 'failed';

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

export interface ScriptSection {
  heading: string;
  narration: string;
}

// 短视频/图文剧本生成结果类型
export interface ScriptResult {
  title: string;
  hook: string;
  positioning: string;
  sections: ScriptSection[];
  cta: string;
}

// 短视频分镜脚本生成结果类型
export interface StoryboardShotResult {
  shotId: string;
  duration: number;
  shotType: string;
  visual: string;
  narration: string;
  subtitle: string;
  cameraMotion: string;
}

// 短视频分镜图/图文提示词生成结果类型
export interface ImagePromptGeneratingResult {
  shotId: string;
  imagePrompt: string;
}

// 短视频分镜图/图文生成结果类型
export interface ImageGeneratingResult {
  shotId: string;
  image: string;
}

// 短视频分镜视频Prompt生成结果类型
export interface VideoPromptGeneratingResult {
  shotId: string;
  videoPrompt: string;
}

// 短视频分镜视频生成结果类型
export interface VideoGeneratingResult {
  shotId: string;
  video: string;
  duration: number;
}


// 短视频分镜视频混剪成片结果类型
export interface EditingResult {
  video: string;
}


// 内容质检结果类型
export type QaReviewDecision = 'pass' | 'fail';
export type QaReviewTargetStage = 'image_generating' | 'video_generating' | 'editing';
export interface QaReviewResult {
  decision: QaReviewDecision;
  targetStage: QaReviewTargetStage;
  score: number;
  reasons: string;
  suggestions: string;
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

export interface TaskRepository {
  list(): Promise<Task[]>;
  findById(_id: string): Promise<Task | null>;
  save(task: Task): Promise<Task>;
  markStageRunning(_id: string, stageName: TaskStageName): Promise<Task | null>;
  markStageCompleted(_id: string, stageName: TaskStageName, output: TaskStageOutput): Promise<Task | null>;
  markStageFailed(_id: string, stageName: TaskStageName, errorMessage: string): Promise<Task | null>;
}

export interface AssetRepository {
  list(): Promise<AssetResource[]>;
  saveMany(assets: AssetResource[]): Promise<AssetResource[]>;
}
