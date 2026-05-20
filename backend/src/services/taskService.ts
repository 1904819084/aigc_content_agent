import { createTaskEntity, resetTaskForRun } from '../domain/task/taskFactory';
import { Injectable } from '@gulux/gulux';
import { createTaskGraph } from '../agents/taskGraph/createTaskGraph';
import { TaskPipelineRunner } from '../agents/taskPipelineRunner';
import { MongoTaskRepository } from '../data/mongoTaskRepository';
import type { TaskBrief, TaskListQuery } from '../types';
import { AppError } from '../utils/appError';
import { isTaskWithinDateRange } from '../utils/taskQuery';

const taskRepository = new MongoTaskRepository();
const taskGraph = createTaskGraph(taskRepository);
const taskPipelineRunner = new TaskPipelineRunner(taskRepository, taskGraph);

@Injectable()
export default class TaskService {
  public async listTasks(query?: TaskListQuery) {
    const taskId = query?.taskId?.trim().toLowerCase() ?? '';
    const productName = query?.productName?.trim().toLowerCase() ?? '';
    const startDate = query?.startDate?.trim() ?? '';
    const endDate = query?.endDate?.trim() ?? '';
    const tasks = await taskRepository.list();

    return tasks.filter((task) => {
      const matchesTaskId = taskId ? task.id.toLowerCase().includes(taskId) : true;
      const matchesProductName = productName
        ? (task.brief.productName || task.name).toLowerCase().includes(productName)
        : true;
      const matchesDateRange = isTaskWithinDateRange(task, startDate, endDate);

      return matchesTaskId && matchesProductName && matchesDateRange;
    });
  }

  public async getTaskById(taskId: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('task_not_found', 404);
    }
    return task;
  }

  public createTask(brief: TaskBrief) {
    return taskRepository.save(createTaskEntity(brief));
  }

  public async runTask(taskId: string) {
    const task = await this.getTaskById(taskId);
    if (task.status !== 'pending' && task.status !== 'failed') {
      throw new AppError('task_already_started', 400);
    }
    const resetTask = await taskRepository.save(resetTaskForRun(task));
    taskPipelineRunner.start(resetTask.id);
    return resetTask;
  }
}
