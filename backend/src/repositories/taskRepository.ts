import { env } from '../config/env';
import type { Task, TaskRepository, TaskStageOutput, TaskStageName } from '../types';
import { getMongoCollection } from './mongoRepository';

export class MongoTaskRepository implements TaskRepository {
  private async getCollection() {
    return getMongoCollection<Task>(env.mongoTaskCollectionName);
  }

  private async findOneAndUpdateTask(
    _id: string,
    update: Record<string, unknown>,
    stageName?: TaskStageName,
  ): Promise<Task | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate({ _id }, update, {
      arrayFilters: stageName ? [{ 'stage.name': stageName }] : undefined,
      returnDocument: 'after',
    });

    return result;
  }

  async list(): Promise<Task[]> {
    const collection = await this.getCollection();
    const documents = await collection.find({}).sort({ updatedAt: -1 }).toArray();
    return documents;
  }

  async findById(_id: string): Promise<Task | null> {
    const collection = await this.getCollection();
    const document = await collection.findOne({ _id });
    return document;
  }

  async save(task: Task): Promise<Task> {
    const collection = await this.getCollection();
    const nextTask = {
      ...task,
      updatedAt: new Date().toISOString(),
    } satisfies Task;

    await collection.replaceOne({ _id: nextTask._id }, nextTask, {
      upsert: true,
    });

    return nextTask;
  }

  async markStageRunning(_id: string, stageName: TaskStageName): Promise<Task | null> {
    const now = new Date().toISOString();

    return this.findOneAndUpdateTask(
      _id,
      {
        $set: {
          status: 'running',
          currentStage: stageName,
          updatedAt: now,
          'stages.$[stage].status': 'running',
          'stages.$[stage].startedAt': now,
          'stages.$[stage].finishedAt': null,
          'stages.$[stage].error': null,
        },
      },
      stageName,
    );
  }

  async markStageCompleted<S extends TaskStageName>(
    _id: string,
    stageName: S,
    output: TaskStageOutput<S>,
  ): Promise<Task | null> {
    const now = new Date().toISOString();

    return this.findOneAndUpdateTask(
      _id,
      {
        $set: {
          updatedAt: now,
          [`outputs.${stageName}`]: output,
          'stages.$[stage].status': 'completed',
          'stages.$[stage].finishedAt': now,
          'stages.$[stage].error': null,
        },
      },
      stageName,
    );
  }

  async markStageFailed(
    _id: string,
    stageName: TaskStageName,
    errorMessage: string,
  ): Promise<Task | null> {
    const now = new Date().toISOString();

    return this.findOneAndUpdateTask(
      _id,
      {
        $set: {
          status: 'failed',
          currentStage: stageName,
          updatedAt: now,
          'stages.$[stage].status': 'failed',
          'stages.$[stage].finishedAt': now,
          'stages.$[stage].error': errorMessage,
        },
      },
      stageName,
    );
  }

  async incrementStageAttempts(_id: string, stageName: TaskStageName): Promise<Task | null> {
    const now = new Date().toISOString();
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id },
      {
        $set: { updatedAt: now },
        $inc: { 'stages.$[stage].attempts': 1 },
      },
      {
        arrayFilters: [{ 'stage.name': stageName }],
        returnDocument: 'after',
      },
    );

    return result;
  }

  async resetStagesFrom(_id: string, stageNames: TaskStageName[]): Promise<Task | null> {
    if (stageNames.length === 0) {
      return this.findById(_id);
    }

    const now = new Date().toISOString();
    const collection = await this.getCollection();
    const unsetOutputs: Record<string, ''> = {};
    for (const name of stageNames) {
      unsetOutputs[`outputs.${name}`] = '';
    }

    const result = await collection.findOneAndUpdate(
      { _id },
      {
        $set: {
          updatedAt: now,
          'stages.$[stage].status': 'pending',
          'stages.$[stage].startedAt': null,
          'stages.$[stage].finishedAt': null,
          'stages.$[stage].error': null,
        },
        $unset: unsetOutputs,
      },
      {
        arrayFilters: [{ 'stage.name': { $in: stageNames } }],
        returnDocument: 'after',
      },
    );

    return result;
  }
}
