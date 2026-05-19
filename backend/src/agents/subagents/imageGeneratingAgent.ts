import { fornaxExecute } from '../../fornax/llm';
import type { ImageGeneratingResult, ImagePromptGeneratingResult, Task } from '../../types';
import { tryParseAgentJson } from '../../utils/agentOutput';
import { AppError, toAppError } from '../../utils/appError';
import { getStageResult } from '../../utils/getStageResult';
import { sanitizeHttpUrl } from '../../utils/url';

const PROMPT_KEY = 'demo.image_generate_agent.prompt';

function isImageGeneratingResult(value: unknown): value is ImageGeneratingResult {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.shotId === 'string' &&
    (typeof record.image === 'string' || typeof record.imageURL === 'string')
  );
}

function buildImageGeneratingResultFromJson(value: unknown): ImageGeneratingResult[] | null {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  const nestedImages =
    Array.isArray(record?.images)
      ? record.images
      : Array.isArray(record?.results)
        ? record.results
        : null;
  const imagesValue = Array.isArray(value)
    ? value.filter(isImageGeneratingResult)
    : nestedImages
      ? nestedImages.filter(isImageGeneratingResult)
      : [];

  if (imagesValue.length === 0) {
    return null;
  }

  return imagesValue.map((image, index) => {
    const imageRecord = image as unknown as { imageURL?: string };

    return {
      shotId: image.shotId.trim() || `shot_${index + 1}`,
      image:
        typeof image.image === 'string' && image.image.trim()
          ? sanitizeHttpUrl(image.image)
          : typeof imageRecord.imageURL === 'string' && imageRecord.imageURL.trim()
            ? sanitizeHttpUrl(imageRecord.imageURL)
            : '',
    };
  });
}

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

    const result =
      response.ok && response.text
        ? buildImageGeneratingResultFromJson(tryParseAgentJson(response.text))
        : null;

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
