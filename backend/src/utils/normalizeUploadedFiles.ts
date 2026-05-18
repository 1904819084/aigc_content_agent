import { UploadedAssetFile } from "../types";

// 标准化上传的文件列表
export function normalizeUploadedFiles(input: unknown): UploadedAssetFile[] {
  const files = Array.isArray(input) ? input : input ? [input] : [];

  return files
    .map((file) => {
      if (!file || typeof file !== 'object') {
        return null;
      }

      const currentFile = file as Record<string, unknown>;
      const originalFilename = currentFile.originalFilename;
      const mimetype = currentFile.mimetype;
      const size = currentFile.size;
      const newFilename = currentFile.newFilename;

      if (
        typeof originalFilename !== 'string' ||
        typeof mimetype !== 'string' ||
        typeof size !== 'number' ||
        typeof newFilename !== 'string'
      ) {
        return null;
      }

      return {
        originalname: originalFilename,
        mimetype,
        size,
        filename: newFilename,
      } satisfies UploadedAssetFile;
    })
    .filter(Boolean);
}