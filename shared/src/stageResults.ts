import type { TaskStageName } from './enums';

/** 短视频/图文剧本生成结果类型 */
export interface ScriptSection {
  heading: string;
  narration: string;
}

export interface ScriptResult {
  title: string;
  hook: string;
  positioning: string;
  sections: ScriptSection[];
  cta: string;
}

/** 短视频分镜脚本生成结果类型 */
export interface StoryboardShotResult {
  shotId: string;
  duration: number;
  shotType: string;
  visual: string;
  narration: string;
  subtitle: string;
  cameraMotion: string;
}

/** 短视频分镜图/图文提示词生成结果类型 */
export interface ImagePromptGeneratingResult {
  shotId: string;
  imagePrompt: string;
}

/** 短视频分镜图/图文生成结果类型 */
export interface ImageGeneratingResult {
  shotId: string;
  image: string;
}

/** 短视频分镜视频 Prompt 生成结果类型 */
export interface VideoPromptGeneratingResult {
  shotId: string;
  videoPrompt: string;
}

/** 短视频分镜视频生成结果类型 */
export interface VideoGeneratingResult {
  shotId: string;
  video: string;
  duration: number;
}

/** 短视频分镜视频混剪成片结果类型 */
export interface EditingResult {
  video: string;
}

/** 内容质检结果类型 */
export type QaReviewDecision = 'pass' | 'fail';
export type QaReviewTargetStage = 'image_generating' | 'video_generating' | 'editing';
export interface QaReviewResult {
  decision: QaReviewDecision;
  targetStage: QaReviewTargetStage;
  score: number;
  reasons: string;
  suggestions: string;
}

/**
 * 阶段输出契约表：把每个 stageName 映射到精确的 output 类型。
 * 前后端共用同一份契约，stage 字段调整时全链路一处变更即整体编译报错。
 */
export interface StageOutputMap {
  script_generating: ScriptResult;
  storyboard_generating: StoryboardShotResult[];
  image_prompt_generating: ImagePromptGeneratingResult[];
  image_generating: ImageGeneratingResult[];
  image_qa_reviewing: QaReviewResult;
  video_prompt_generating: VideoPromptGeneratingResult[];
  video_generating: VideoGeneratingResult[];
  video_qa_reviewing: QaReviewResult;
  editing: EditingResult;
  editing_qa_reviewing: QaReviewResult;
}

// 编译期断言：StageOutputMap 的 keys 必须等于 TaskStageName，避免遗漏 stage。
type _AssertStageOutputMapCovered = TaskStageName extends keyof StageOutputMap ? true : never;
type _AssertStageOutputMapNoExtra = keyof StageOutputMap extends TaskStageName ? true : never;
const _stageOutputMapKeysCovered: _AssertStageOutputMapCovered = true;
const _stageOutputMapKeysNoExtra: _AssertStageOutputMapNoExtra = true;
void _stageOutputMapKeysCovered;
void _stageOutputMapKeysNoExtra;
