import path from 'node:path';
import { env } from '../config/env';
import { FileTaskRepository } from './fileTaskRepository';
import { InMemoryTaskRepository } from './inMemoryTaskRepository';

export function createTaskRepository() {
  if (env.taskRepositoryDriver === 'memory') {
    return new InMemoryTaskRepository();
  }

  const storageFilePath = path.resolve(process.cwd(), 'runtime-data/tasks.json');
  return new FileTaskRepository(storageFilePath);
}
