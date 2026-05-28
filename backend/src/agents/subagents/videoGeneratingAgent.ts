import type { Task, VideoGeneratingResult } from '../../types';
import { getStageResult } from '../../utils/getStageResult';
import { sanitizeHttpUrl } from '../../utils/url';
import { buildJsonResultParser, createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';

const PROMPT_KEY = 'demo.video_generate_agent.prompt';

function isVideoGeneratingResult(value: unknown): value is VideoGeneratingResult {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.shotId === 'string' &&
    (
      typeof record.video === 'string' ||
      typeof record.videoURL === 'string' ||
      typeof record.previewUrl === 'string' ||
      typeof record.url === 'string'
    )
  );
}

function buildVideoGeneratingResultFromJson(value: unknown): VideoGeneratingResult[] | null {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  const nestedVideos =
    Array.isArray(record?.videos)
      ? record.videos
      : Array.isArray(record?.results)
        ? record.results
        : null;
  const videoValues = Array.isArray(value)
    ? value.filter(isVideoGeneratingResult)
    : nestedVideos
      ? nestedVideos.filter(isVideoGeneratingResult)
      : [];

  if (videoValues.length === 0) {
    return null;
  }

  return videoValues.map((item, index) => {
    const itemRecord = item as unknown as Record<string, unknown>;
    const rawVideo =
      typeof itemRecord.video === 'string'
        ? itemRecord.video
        : typeof itemRecord.videoURL === 'string'
          ? itemRecord.videoURL
          : typeof itemRecord.previewUrl === 'string'
            ? itemRecord.previewUrl
            : typeof itemRecord.url === 'string'
              ? itemRecord.url
              : '';
    const rawDuration = typeof itemRecord.duration === 'number' ? itemRecord.duration : 5;

    return {
      shotId: item.shotId.trim() || `shot_${index + 1}`,
      video: sanitizeHttpUrl(rawVideo),
      duration: Number.isFinite(rawDuration) && rawDuration > 0 ? Math.round(rawDuration) : 5,
    };
  });
}

// 短视频分镜视频生成agent
export const runVideoGeneratingAgent = createLLMStageAgent<'video_generating'>({
  promptKey: PROMPT_KEY,
  getInput: (task: Task) => ({
    VideoPromptList: getStageResult(task, 'video_prompt_generating'),
    ImageList: getStageResult(task, 'image_generating'),
  }),
  parseResult: buildJsonResultParser<'video_generating', void>(buildVideoGeneratingResultFromJson),
  invalidSchemaError: 'fornax_video_generating_result_invalid_schema',
  executeError: 'fornax_video_generating_failed',
});
