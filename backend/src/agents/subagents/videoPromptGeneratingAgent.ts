import { fornaxExecute } from '../../fornax/llm';
import type { StoryboardShotResult, Task, VideoPromptGeneratingResult } from '../../types';
import { tryParseAgentJson } from '../../utils/agentOutput';
import { toAppError } from '../../utils/appError';
import { getStageResult } from '../../utils/getStageResult';

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

// 分镜视频提示词生成agent
export async function runVideoPromptGeneratingAgent(task: Task) {
  const storyboard = getStageResult<StoryboardShotResult[]>(task, 'storyboard_generating');

  try {
    const response = await fornaxExecute({
      promptKey: PROMPT_KEY,
      variables: {
        StoryboardShot: JSON.stringify(storyboard, null, 2),
      },
      callOptions: {},
    });

    const result =
      response.ok && response.text
        ? buildVideoPromptResultFromJson(tryParseAgentJson(response.text))
        : null;

    return {
      input: {
        storyboard,
      },
      output: result,
    };
  } catch (error) {
    throw toAppError(error, 'fornax_video_prompt_generating_failed', 502);
  }
}
