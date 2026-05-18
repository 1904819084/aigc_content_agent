import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  taskRepositoryDriver: process.env.TASK_REPOSITORY_DRIVER ?? 'file',
} as const;
