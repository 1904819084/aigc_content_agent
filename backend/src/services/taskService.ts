import { createTaskEntity, resetTaskForRun } from '../domain/task/taskFactory';
import { Injectable } from '@gulux/gulux';
import { createImageTextTaskGraph } from '../agents/taskGraph/createImageTextTaskGraph';
import { createShortVideoTaskGraph } from '../agents/taskGraph/createShortVideoTaskGraph';
import { TaskRunner } from '../agents/taskRunner';
import { MongoTaskRepository } from '../data/mongoTaskRepository';
import type { TaskBrief, TaskListQuery } from '../types';
import { AppError } from '../utils/appError';
import { isTaskWithinDateRange } from '../utils/taskQuery';

const taskRepository = new MongoTaskRepository();
const shortVideoTaskGraph = createShortVideoTaskGraph(taskRepository);
const imageTextTaskGraph = createImageTextTaskGraph(taskRepository);
const shortVideoTaskRunner = new TaskRunner(taskRepository, shortVideoTaskGraph);
const imageTextTaskRunner = new TaskRunner(taskRepository, imageTextTaskGraph);

@Injectable()
export default class TaskService {
  public async listTasks(query?: TaskListQuery) {
    const _id = query?._id?.trim().toLowerCase() ?? '';
    const productName = query?.productName?.trim().toLowerCase() ?? '';
    const startDate = query?.startDate?.trim() ?? '';
    const endDate = query?.endDate?.trim() ?? '';
    const tasks = await taskRepository.list();

    return tasks.filter((task) => {
      const matchesTaskId = _id ? task._id.toLowerCase().includes(_id) : true;
      const matchesProductName = productName
        ? (task.brief.productName || task.name).toLowerCase().includes(productName)
        : true;
      const matchesDateRange = isTaskWithinDateRange(task, startDate, endDate);

      return matchesTaskId && matchesProductName && matchesDateRange;
    });
  }

  public async getTaskById(_id: string) {
    const task = await taskRepository.findById(_id);
    if (!task) {
      throw new AppError('task_not_found', 404);
    }
    return task;
  }

  public createTask(brief: TaskBrief) {
    return taskRepository.save(createTaskEntity(brief));
  }

  public async runTask(_id: string) {
    const task = await this.getTaskById(_id);
    if (task.status !== 'pending' && task.status !== 'failed') {
      throw new AppError('task_already_started', 400);
    }
    const resetTask = await taskRepository.save(resetTaskForRun(task));
    const runner =
      resetTask.brief.taskType === 'image_text' ? imageTextTaskRunner : shortVideoTaskRunner;
    runner.start(resetTask._id);
    return resetTask;
  }
}
