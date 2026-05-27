import { createTaskEntity, resetTaskForRun } from '../domain/task/taskFactory';
import { Injectable } from '@gulux/gulux';
import type { TaskBrief, TaskListQuery } from '../types';
import { AppError } from '../utils/appError';
import { isTaskWithinDateRange } from '../utils/taskQuery';
import { pickRunner, taskRepository } from './taskRuntime';

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

  /**
   * 触发任务执行：
   * - pending / failed：fresh start，重置 stages/outputs；
   * - running：续跑场景（多见于进程崩溃后用户手动点"运行"），保留 stages 与 checkpoint，
   *   由 TaskRunner 内部 getState 检测到 checkpoint 后自动从最近 superstep 恢复；
   * - 其他状态（如 completed）拒绝重复触发。
   */
  public async runTask(_id: string) {
    const task = await this.getTaskById(_id);
    if (task.status !== 'pending' && task.status !== 'failed' && task.status !== 'running') {
      throw new AppError('task_already_started', 400);
    }
    const persistedTask =
      task.status === 'running' ? task : await taskRepository.save(resetTaskForRun(task));
    const runner = await pickRunner(persistedTask);
    runner.start(persistedTask._id);
    return persistedTask;
  }
}
