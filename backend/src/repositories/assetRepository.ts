import { env } from '../config/env';
import type { AssetRepository, AssetResource } from '../types';
import { getMongoCollection } from './mongoRepository';

export class MongoAssetRepository implements AssetRepository {
  private async getCollection() {
    return getMongoCollection<AssetResource>(env.mongoAssetCollectionName);
  }

  async list(): Promise<AssetResource[]> {
    const collection = await this.getCollection();
    const documents = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return documents;
  }

  async saveMany(assets: AssetResource[]): Promise<AssetResource[]> {
    const collection = await this.getCollection();

    await Promise.all(
      assets.map((asset) => {
        return collection.replaceOne({ _id: asset._id }, asset, {
          upsert: true,
        });
      }),
    );

    return assets;
  }
}
