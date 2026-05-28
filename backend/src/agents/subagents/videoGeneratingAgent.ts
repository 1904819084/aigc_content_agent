import type { Task } from '../../types';
import { getStageResult } from '../../utils/getStageResult';
import { sanitizeHttpUrl } from '../../utils/url';
import { createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';
import { tryParseAgentJson } from '../../utils/agentOutput';

const PROMPT_KEY = 'demo.video_generate_agent.prompt';

/**
 * fornax 返回的视频列表字段不稳定（video / videoURL / previewUrl / url 任选其一），
 * 这里在进入 zod 校验之前先做字段归一化 + sanitizeHttpUrl，让 schema 只关心最终 shape。
 */
function pickVideoUrl(item: Record<string, unknown>): string {
  const candidates = ['video', 'videoURL', 'previewUrl', 'url'] as const;
  for (const key of candidates) {
    const value = item[key];
    if (typeof value === 'string') {
      return sanitizeHttpUrl(value);
    }
  }
  return '';
}

function normalizeVideoList(value: unknown): unknown {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  const sourceList = Array.isArray(value)
    ? value
    : Array.isArray(record?.videos)
      ? record.videos
      : Array.isArray(record?.results)
        ? record.results
        : null;

  if (!Array.isArray(sourceList)) {
    return null;
  }

  return sourceList.flatMap((raw) => {
    if (!raw || typeof raw !== 'object') {
      return [];
    }
    const item = raw as Record<string, unknown>;
    return [
      {
        shotId: typeof item.shotId === 'string' ? item.shotId : '',
        video: pickVideoUrl(item),
        duration: typeof item.duration === 'number' ? item.duration : 5,
      },
    ];
  });
}

// 短视频分镜视频生成agent
export const runVideoGeneratingAgent = createLLMStageAgent({
  stageName: 'video_generating',
  promptKey: PROMPT_KEY,
  getInput: (task: Task) => ({
    VideoPromptList: getStageResult(task, 'video_prompt_generating'),
    ImageList: getStageResult(task, 'image_generating'),
  }),
  extractValue: (response) => {
    if (!response.ok || !response.text) {
      return null;
    }
    return normalizeVideoList(tryParseAgentJson(response.text));
  },
  invalidSchemaError: 'fornax_video_generating_result_invalid_schema',
  executeError: 'fornax_video_generating_failed',
});
