import { fornaxExecute } from '../../fornax/llm';
import type { ImageGeneratingResult, ImagePromptGeneratingResult, Task } from '../../types';
import { AppError, toAppError } from '../../utils/appError';
import { getStageResult } from '../../utils/getStageResult';
import { sanitizeHttpUrl } from '../../utils/url';

const PROMPT_KEY = 'demo.image_generate_agent.prompt';

type FornaxMessagePart = {
  type?: unknown;
  image_url?: {
    url?: unknown;
  };
};

function buildImageGeneratingResultFromParts(raw: unknown): ImageGeneratingResult[] | null {
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
      shotId: `shot_${imageIndex}`,
      image,
    }];
  });
  
  return results.length > 0 ? results : null;
}

// 分镜图生成agent
export async function runImageGeneratingAgent(task: Task) {
  const imagePromptList = getStageResult<ImagePromptGeneratingResult[]>(task, 'image_prompt_generating');

  try {
    const response = await fornaxExecute({
      promptKey: PROMPT_KEY,
      variables: {
        ImagePromptList: JSON.stringify(imagePromptList, null, 2),
      },
      callOptions: {},
    });

    const result = response.ok ? buildImageGeneratingResultFromParts(response.raw) : null;

    if (!result || result.length === 0) {
      throw new AppError('fornax_image_generating_result_invalid_schema', 502);
    }

    return {
      input: {
        imagePromptList,
      },
      output: result,
    };
  } catch (error) {
    throw toAppError(error, 'fornax_image_generating_failed', 502);
  }
}
