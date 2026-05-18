import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Task, TaskRepository } from '../types';

function ensureStorageFile(storageFilePath: string) {
  const directoryPath = path.dirname(storageFilePath);

  if (!existsSync(directoryPath)) {
    mkdirSync(directoryPath, { recursive: true });
  }

  if (!existsSync(storageFilePath)) {
    writeFileSync(storageFilePath, '[]', 'utf-8');
  }
}

export class FileTaskRepository implements TaskRepository {
  private readonly storageFilePath: string;

  constructor(storageFilePath: string) {
    this.storageFilePath = storageFilePath;
    ensureStorageFile(storageFilePath);
  }

  private readTasks(): Task[] {
    ensureStorageFile(this.storageFilePath);
    const fileContent = readFileSync(this.storageFilePath, 'utf-8');
    const tasks = JSON.parse(fileContent);

    return Array.isArray(tasks) ? tasks : [];
  }

  private writeTasks(tasks: Task[]) {
    writeFileSync(this.storageFilePath, JSON.stringify(tasks, null, 2), 'utf-8');
  }

  list() {
    return this.readTasks().sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  findById(taskId: string) {
    return this.readTasks().find((task) => task.id === taskId) ?? null;
  }

  save(task: Task) {
    const tasks = this.readTasks();
    const nextTask = {
      ...task,
      updatedAt: new Date().toISOString(),
    } satisfies Task;
    const targetIndex = tasks.findIndex((item) => item.id === nextTask.id);

    if (targetIndex >= 0) {
      tasks[targetIndex] = nextTask;
    } else {
      tasks.push(nextTask);
    }

    this.writeTasks(tasks);
    return nextTask;
  }
}
