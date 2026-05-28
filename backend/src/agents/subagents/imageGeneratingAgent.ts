import type { ImageGeneratingResult, Task } from '../../types';
import { getStageResult } from '../../utils/getStageResult';
import { sanitizeHttpUrl } from '../../utils/url';
import { createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';

const PROMPT_KEY = 'demo.image_generate_agent.prompt';

type FornaxMessagePart = {
  type?: unknown;
  image_url?: {
    url?: unknown;
  };
};

function buildImageGeneratingResultFromParts(task: Task, raw: unknown): ImageGeneratingResult[] | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as {
    choices?: Array<{
      message?: {
        parts?: unknown;
      };
    }>;
  };
  const parts = record.choices?.[0]?.message?.parts;

  if (!Array.isArray(parts)) {
    return null;
  }

  let imageIndex = 0;
  const results = parts.flatMap((part) => {
    if (!part || typeof part !== 'object') {
      return [];
    }
    const partRecord = part as FornaxMessagePart;
    if (partRecord.type !== 'image_url' || typeof partRecord.image_url?.url !== 'string') {
      return [];
    }
    const image = sanitizeHttpUrl(partRecord.image_url.url);
    if (!image) {
      return [];
    }
    imageIndex += 1;
    return [{
      shotId: task.brief.taskType === 'image_text' ? `image_${imageIndex}` : `shot_${imageIndex}`,
      image,
    }];
  });

  return results.length > 0 ? results : null;
}

// 短视频分镜图/图文生成agent
export const runImageGeneratingAgent = createLLMStageAgent<'image_generating'>({
  promptKey: PROMPT_KEY,
  getInput: (task: Task) => {
    const imagePromptList = getStageResult(task, 'image_prompt_generating');
    return task.brief.taskType === 'image_text'
      ? { ImageText_ImagePromptList: imagePromptList }
      : { ShortVideo_ImagePromptList: imagePromptList };
  },
  // 图片生成阶段需要从 fornax response.raw 解析，而不是 response.text。
  parseResult: (response, task) => {
    if (!response.ok) {
      return null;
    }
    return buildImageGeneratingResultFromParts(task, response.raw);
  },
  invalidSchemaError: 'fornax_image_generating_result_invalid_schema',
  executeError: 'fornax_image_generating_failed',
});
