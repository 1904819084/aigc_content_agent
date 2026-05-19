import { Injectable } from '@gulux/gulux';
import { createAssetRepository } from '../data/createAssetRepository';
import type { UploadedAssetFile } from '../types';
import { AppError } from '../utils/appError';

const assetRepository = createAssetRepository();

@Injectable()
export default class AssetService {
  public createAssetsFromUploadedFiles(files: UploadedAssetFile[]) {
    if (files.length === 0) {
      throw new AppError('asset_files_required', 400);
    }

    const assets = files.map((file) => {
      return {
        id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        createdAt: new Date().toISOString(),
      };
    });

    assetRepository.saveMany(assets);
    return assets;
  }
}
