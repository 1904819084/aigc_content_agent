import type { Task, VideoPromptGeneratingResult } from '../../types';
import { getStageResult } from '../../utils/getStageResult';
import { buildJsonResultParser, createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';

const PROMPT_KEY = 'demo.video_prompt_generate.prompt';

function isVideoPromptGeneratingResult(value: unknown): value is VideoPromptGeneratingResult {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.shotId === 'string' && typeof record.videoPrompt === 'string';
}

function buildVideoPromptResultFromJson(value: unknown): VideoPromptGeneratingResult[] | null {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  const nestedPrompts =
    Array.isArray(record?.prompts)
      ? record.prompts
      : Array.isArray(record?.results)
        ? record.results
        : null;
  const promptValues = Array.isArray(value)
    ? value.filter(isVideoPromptGeneratingResult)
    : nestedPrompts
      ? nestedPrompts.filter(isVideoPromptGeneratingResult)
      : [];

  if (promptValues.length === 0) {
    return null;
  }

  return promptValues.map((item, index) => ({
    shotId: item.shotId.trim() || `shot_${index + 1}`,
    videoPrompt: item.videoPrompt.trim(),
  }));
}

// 短视频分镜视频提示词生成agent
export const runVideoPromptGeneratingAgent = createLLMStageAgent<'video_prompt_generating'>({
  promptKey: PROMPT_KEY,
  getInput: (task: Task) => ({
    storyboard: getStageResult(task, 'storyboard_generating'),
  }),
  // input 中的 storyboard 字段需要以 StoryboardShot 名义传给 prompt
  getVariables: (input) => ({
    StoryboardShot: JSON.stringify(input.storyboard, null, 2),
  }),
  parseResult: buildJsonResultParser<'video_prompt_generating', void>((value) => {
    const result = buildVideoPromptResultFromJson(value);
    return result && result.length > 0 ? result : null;
  }),
  invalidSchemaError: 'fornax_video_prompt_result_invalid_schema',
  executeError: 'fornax_video_prompt_generating_failed',
});
