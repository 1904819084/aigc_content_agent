import type { Collection } from 'mongodb';
import { getMongoDb } from './mongo';

export type MongoEntityDocument<TEntity extends { id: string }> = TEntity & { _id: string };

export async function getMongoCollection<TDocument>(collectionName: string): Promise<Collection<TDocument>> {
  const db = await getMongoDb();
  return db.collection<TDocument>(collectionName);
}

export function toMongoDocument<TEntity extends { id: string }>(
  entity: TEntity,
): MongoEntityDocument<TEntity> {
  return {
    ...entity,
    _id: entity.id,
  };
}

export function toMongoEntity<TEntity extends { id: string }>(
  document: MongoEntityDocument<TEntity>,
): TEntity {
  const entity = { ...document };
  delete entity._id;
  return entity;
}
