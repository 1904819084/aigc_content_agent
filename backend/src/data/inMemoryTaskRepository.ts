import type { Task, TaskRepository } from '../types';

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  list() {
    return Array.from(this.tasks.values()).sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  findById(taskId: string) {
    return this.tasks.get(taskId) ?? null;
  }

  save(task: Task) {
    const nextTask = {
      ...task,
      updatedAt: new Date().toISOString(),
    } satisfies Task;

    this.tasks.set(nextTask.id, nextTask);
    return nextTask;
  }
}
