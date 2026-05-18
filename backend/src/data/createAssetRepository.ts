import path from 'node:path';
import { FileAssetRepository } from './fileAssetRepository';

export function createAssetRepository() {
  const storageFilePath = path.resolve(process.cwd(), 'runtime-data/assets.json');
  return new FileAssetRepository(storageFilePath);
}
