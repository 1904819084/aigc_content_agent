import { Inject, Injectable } from '@gulux/gulux';
import type { UploadedAssetFile } from '../types';
import { MongoAssetRepository } from '../repositories/assetRepository';
import { AppError } from '../utils/appError';

@Injectable()
export default class AssetService {
  @Inject()
  private readonly assetRepository!: MongoAssetRepository;

  public async createAssetsFromUploadedFiles(files: UploadedAssetFile[]) {
    if (files.length === 0) {
      throw new AppError('asset_files_required', 400);
    }

    const assets = files.map((file) => {
      return {
        _id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        createdAt: new Date().toISOString(),
      };
    });

    await this.assetRepository.saveMany(assets);
    return assets;
  }
}
