import type { AssetResource, TaskBrief } from '../types';

// 校验任务资产是否有效
export function isTaskAssetValid(asset: unknown): asset is AssetResource {
  const currentAsset = asset as AssetResource | null;
  return (
    typeof currentAsset?.id === 'string' &&
    currentAsset.id.trim().length > 0 &&
    typeof currentAsset.name === 'string' &&
    currentAsset.name.trim().length > 0 &&
    typeof currentAsset.mimeType === 'string' &&
    currentAsset.mimeType.trim().length > 0 &&
    typeof currentAsset.url === 'string' &&
    currentAsset.url.trim().length > 0 &&
    typeof currentAsset.createdAt === 'string' &&
    currentAsset.createdAt.trim().length > 0 &&
    typeof currentAsset.size === 'number' &&
    Number.isFinite(currentAsset.size)
  );
}

// 校验任务简要描述是否有效
export function isTaskBriefValid(payload: unknown): payload is TaskBrief {
  const currentPayload = payload as Partial<TaskBrief> | null;
  const hasValidProductName =
    typeof currentPayload?.productName === 'string' && currentPayload.productName.trim().length > 0;
  const hasValidVideoPrompt =
    currentPayload?.videoPrompt === undefined || typeof currentPayload.videoPrompt === 'string';
  const hasValidProductImages =
    currentPayload?.productImages === undefined ||
    (Array.isArray(currentPayload.productImages) &&
      currentPayload.productImages.length <= 3 &&
      currentPayload.productImages.every(isTaskAssetValid));

  return hasValidProductName && hasValidVideoPrompt && hasValidProductImages;
}

// 标准化任务简要描述
export function normalizeTaskBrief(payload: TaskBrief): TaskBrief {
  return {
    productName: payload.productName.trim(),
    productImages: Array.isArray(payload.productImages)
      ? payload.productImages.slice(0, 3).map((item) => ({
          id: item.id.trim(),
          name: item.name.trim(),
          mimeType: item.mimeType.trim(),
          size: item.size,
          url: item.url.trim(),
          createdAt: item.createdAt.trim(),
        }))
      : [],
    videoPrompt: typeof payload.videoPrompt === 'string' ? payload.videoPrompt.trim() : '',
  };
}
