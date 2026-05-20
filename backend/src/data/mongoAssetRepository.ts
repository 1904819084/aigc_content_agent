import { env } from '../config/env';
import type { AssetRepository, AssetResource } from '../types';
import {
  getMongoCollection,
  toMongoDocument,
  toMongoEntity,
  type MongoEntityDocument,
} from './mongoRepositoryUtils';

type AssetDocument = MongoEntityDocument<AssetResource>;

export class MongoAssetRepository implements AssetRepository {
  private async getCollection() {
    return getMongoCollection<AssetDocument>(env.mongoAssetCollectionName);
  }

  async list(): Promise<AssetResource[]> {
    const collection = await this.getCollection();
    const documents = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return documents.map(toMongoEntity<AssetResource>);
  }

  async saveMany(assets: AssetResource[]): Promise<AssetResource[]> {
    const collection = await this.getCollection();

    await Promise.all(
      assets.map((asset) => {
        return collection.replaceOne({ _id: asset.id }, toMongoDocument(asset), {
          upsert: true,
        });
      }),
    );

    return assets;
  }
}
