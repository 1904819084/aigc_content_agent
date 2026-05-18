import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { AssetRepository, AssetResource } from '../types';

function ensureStorageFile(storageFilePath: string) {
  const directoryPath = path.dirname(storageFilePath);

  if (!existsSync(directoryPath)) {
    mkdirSync(directoryPath, { recursive: true });
  }

  if (!existsSync(storageFilePath)) {
    writeFileSync(storageFilePath, '[]', 'utf-8');
  }
}

export class FileAssetRepository implements AssetRepository {
  private readonly storageFilePath: string;

  constructor(storageFilePath: string) {
    this.storageFilePath = storageFilePath;
    ensureStorageFile(storageFilePath);
  }

  private readAssets(): AssetResource[] {
    ensureStorageFile(this.storageFilePath);
    const fileContent = readFileSync(this.storageFilePath, 'utf-8');
    const assets = JSON.parse(fileContent);

    return Array.isArray(assets) ? assets : [];
  }

  private writeAssets(assets: AssetResource[]) {
    writeFileSync(this.storageFilePath, JSON.stringify(assets, null, 2), 'utf-8');
  }

  list() {
    return this.readAssets().sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  saveMany(assets: AssetResource[]) {
    const currentAssets = this.readAssets();
    const mergedAssets = [...currentAssets];

    assets.forEach((asset) => {
      const targetIndex = mergedAssets.findIndex((item) => item.id === asset.id);

      if (targetIndex >= 0) {
        mergedAssets[targetIndex] = asset;
        return;
      }

      mergedAssets.push(asset);
    });

    this.writeAssets(mergedAssets);
    return assets;
  }
}
