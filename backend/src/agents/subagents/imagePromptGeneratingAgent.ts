import type { ImagePromptGeneratingResult, Task } from '../../types';
import { getStageResult } from '../../utils/getStageResult';
import { buildJsonResultParser, createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';

const PROMPT_KEY = 'demo.image_prompt_generate.prompt';

function buildImagePromptResultFromJson(value: unknown): ImagePromptGeneratingResult[] | null {
  const promptValues: unknown[] = Array.isArray(value) ? value : [];
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
export const runImagePromptGeneratingAgent = createLLMStageAgent<'image_prompt_generating'>({
  promptKey: PROMPT_KEY,
  // 短视频取 storyboard，图文取 script 的 sections。
  getInput: (task: Task) => {
    const taskType = task.brief.taskType ?? 'short_video';
    return taskType === 'image_text'
      ? { imageText_Script_Sections: getStageResult(task, 'script_generating').sections || [] }
      : { StoryboardShot: getStageResult(task, 'storyboard_generating') };
  },
  parseResult: buildJsonResultParser<'image_prompt_generating', void>((value) => {
    const result = buildImagePromptResultFromJson(value);
    return result && result.length > 0 ? result : null;
  }),
  invalidSchemaError: 'fornax_image_prompt_result_invalid_schema',
  executeError: 'fornax_image_prompt_generating_failed',
});
