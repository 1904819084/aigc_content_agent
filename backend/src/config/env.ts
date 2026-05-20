import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUri: process.env.MONGO_URI ?? 'mongodb://root:123456@127.0.0.1:27017/?authSource=admin',
  mongoDbName: process.env.MONGO_DB_NAME ?? 'AIGC_content_agent',
  mongoTaskCollectionName: process.env.MONGO_TASK_COLLECTION_NAME ?? 'tasks',
  mongoAssetCollectionName: process.env.MONGO_ASSET_COLLECTION_NAME ?? 'assets',
} as const;
