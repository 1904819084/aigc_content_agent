import { createTaskEntity, resetTaskForRun } from '../domain/task/taskFactory';
import { Injectable } from '@gulux/gulux';
import { createTaskGraph } from '../agents/taskGraph/createTaskGraph';
import { TaskPipelineRunner } from '../agents/taskPipelineRunner';
import { createTaskRepository } from '../data/createTaskRepository';
import type { TaskBrief } from '../types';

const taskRepository = createTaskRepository();
const taskGraph = createTaskGraph(taskRepository);
const taskPipelineRunner = new TaskPipelineRunner(taskRepository, taskGraph);

@Injectable()
export default class TaskService {
  public listTasks() {
    return taskRepository.list();
  }

  public getTaskById(taskId: string) {
    const task = taskRepository.findById(taskId);

    if (!task) {
      throw Object.assign(new Error('task_not_found'), { statusCode: 404 });
    }

    return task;
  }

  public createTask(brief: TaskBrief) {
    return taskRepository.save(createTaskEntity(brief));
  }

  public runTask(taskId: string) {
    const task = this.getTaskById(taskId);

    if (task.status !== 'pending' && task.status !== 'failed') {
      throw Object.assign(new Error('task_already_started'), { statusCode: 400 });
    }

    const resetTask = taskRepository.save(resetTaskForRun(task));
    taskPipelineRunner.start(resetTask.id);
    return resetTask;
  }
}
