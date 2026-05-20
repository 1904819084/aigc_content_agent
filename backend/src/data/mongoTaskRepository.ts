import { env } from '../config/env';
import type { Task, TaskRepository } from '../types';
import {
  getMongoCollection,
  toMongoDocument,
  toMongoEntity,
  type MongoEntityDocument,
} from './mongoRepositoryUtils';

type TaskDocument = MongoEntityDocument<Task>;

export class MongoTaskRepository implements TaskRepository {
  private async getCollection() {
    return getMongoCollection<TaskDocument>(env.mongoTaskCollectionName);
  }

  async list(): Promise<Task[]> {
    const collection = await this.getCollection();
    const documents = await collection.find({}).sort({ updatedAt: -1 }).toArray();
    return documents.map(toMongoEntity<Task>);
  }

  async findById(taskId: string): Promise<Task | null> {
    const collection = await this.getCollection();
    const document = await collection.findOne({ _id: taskId });
    return document ? toMongoEntity<Task>(document) : null;
  }

  async save(task: Task): Promise<Task> {
    const collection = await this.getCollection();
    const nextTask = {
      ...task,
      updatedAt: new Date().toISOString(),
    } satisfies Task;

    await collection.replaceOne({ _id: nextTask.id }, toMongoDocument(nextTask), {
      upsert: true,
    });

    return nextTask;
  }
}
