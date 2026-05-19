import { fornaxExecute } from '../../fornax/llm';
import type { ImagePromptGeneratingResult, StoryboardShotResult, Task } from '../../types';
import { tryParseAgentJson } from '../../utils/agentOutput';
import { toAppError } from '../../utils/appError';
import { getStageResult } from '../../utils/getStageResult';

const PROMPT_KEY = 'demo.image_prompt_generate.prompt';

function isImagePromptGeneratingResult(value: unknown): value is ImagePromptGeneratingResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.shotId === 'string' && typeof record.imagePrompt === 'string';
}

function buildImagePromptResultFromJson(value: unknown): ImagePromptGeneratingResult[] | null {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  const nestedPrompts =
    Array.isArray(record?.prompts)
      ? record.prompts
      : Array.isArray(record?.results)
        ? record.results
        : null;
  const promptValues = Array.isArray(value)
    ? value.filter(isImagePromptGeneratingResult)
    : nestedPrompts
      ? nestedPrompts.filter(isImagePromptGeneratingResult)
      : [];

  if (promptValues.length === 0) {
    return null;
  }

  return promptValues.map((item, index) => ({
    shotId: item.shotId.trim() || `shot_${index + 1}`,
    imagePrompt: item.imagePrompt.trim(),
  }));
}

export async function runImagePromptGeneratingAgent(task: Task) {
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
        ? buildImagePromptResultFromJson(tryParseAgentJson(response.text))
        : null;


    return {
      input: {
        storyboard,
      },
      output: result,
    };
  } catch (error) {
    throw toAppError(error, 'fornax_image_prompt_generating_failed', 502);
  }
}
