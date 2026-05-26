import { fornaxExecute } from '../../fornax/llm';
import type {
  ImagePromptGeneratingResult,
  ScriptResult,
  StoryboardShotResult,
  Task,
} from '../../types';
import { tryParseAgentJson } from '../../utils/agentOutput';
import { AppError, toAppError } from '../../utils/appError';
import { getStageResult } from '../../utils/getStageResult';

const PROMPT_KEY = 'demo.image_prompt_generate.prompt';

function buildImagePromptResultFromJson(value: unknown): ImagePromptGeneratingResult[] | null {
  let promptValues: unknown[];
  if (Array.isArray(value)) {
    promptValues = value;
  }  else {
    promptValues = [];
  }
  if (promptValues.length === 0) {
    return null;
  }

  return promptValues.map((raw, index) => {
    const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const shotIdRaw = typeof item.shotId === 'string' ? item.shotId.trim() : '';
    const imagePromptRaw = typeof item.imagePrompt === 'string' ? item.imagePrompt.trim() : '';
    return {
      shotId: shotIdRaw || `shot_${index + 1}`,
      imagePrompt: imagePromptRaw,
    };
  });
}

// 短视频分镜图/图文提示词生成 agent
export async function runImagePromptGeneratingAgent(task: Task) {
  const taskType = task.brief.taskType ?? 'short_video';

  // 短视频取 storyboard，图文取 script的 sections。
  const upstreamInput =
    taskType === 'image_text'
      ? { imageText_Script_Sections: getStageResult<ScriptResult>(task, 'script_generating').sections || [] }
      : { StoryboardShot: getStageResult<StoryboardShotResult[]>(task, 'storyboard_generating') };

  try {
    const response = await fornaxExecute({
      promptKey: PROMPT_KEY,
      variables: Object.fromEntries(
        Object.entries(upstreamInput).map(([key, value]) => [key, JSON.stringify(value, null, 2)]),
      ),
      callOptions: {},
    });

    const result =
      response.ok && response.text
        ? buildImagePromptResultFromJson(tryParseAgentJson(response.text))
        : null;

    if (!result || result.length === 0) {
      throw new AppError('fornax_image_prompt_result_invalid_schema', 502);
    }

    return {
      input: upstreamInput,
      output: result,
    };
  } catch (error) {
    throw toAppError(error, 'fornax_image_prompt_generating_failed', 502);
  }
}
