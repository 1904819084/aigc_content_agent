import { fornaxExecute } from '../../fornax/llm';
import type {
  ImageGeneratingResult,
  Task,
  VideoGeneratingResult,
  VideoPromptGeneratingResult,
} from '../../types';
import { tryParseAgentJson } from '../../utils/agentOutput';
import { AppError, toAppError } from '../../utils/appError';
import { getStageResult } from '../../utils/getStageResult';
import { sanitizeHttpUrl } from '../../utils/url';

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
export async function runVideoGeneratingAgent(task: Task) {
  const imageList = getStageResult<ImageGeneratingResult[]>(task, 'image_generating');
  const videoPromptList = getStageResult<VideoPromptGeneratingResult[]>(task, 'video_prompt_generating');

  try {
    const response = await fornaxExecute({
      promptKey: PROMPT_KEY,
      variables: {
        VideoPromptList: JSON.stringify(videoPromptList, null, 2),
        ImageList: JSON.stringify(imageList, null, 2),
      },
      callOptions: {},
    });

    const result =
      response.ok && response.text
        ? buildVideoGeneratingResultFromJson(tryParseAgentJson(response.text))
        : null;

    if (!result || result.length === 0) {
      throw new AppError('fornax_video_generating_result_invalid_schema', 502);
    }

    return {
      input: {
        VideoPromptList: videoPromptList,
        ImageList: imageList,
      },
      output: result,
    };
  } catch (error) {
    throw toAppError(error, 'fornax_video_generating_failed', 502);
  }
}
