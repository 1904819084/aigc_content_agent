import type { Collection } from 'mongodb';
import { MongoClient } from 'mongodb';
import { env } from '../config/env';

let mongoClientPromise: Promise<MongoClient> | null = null;

async function getMongoClient() {
  if (!mongoClientPromise) {
    const client = new MongoClient(env.mongoUri);
    mongoClientPromise = client.connect();
  }
  return mongoClientPromise;
}

export async function getMongoDb() {
  const client = await getMongoClient();
  return client.db(env.mongoDbName);
}

export async function getMongoCollection<TDocument>(collectionName: string): Promise<Collection<TDocument>> {
  const db = await getMongoDb();
  return db.collection<TDocument>(collectionName);
}
