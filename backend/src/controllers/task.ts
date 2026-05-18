import { Inject } from '@gulux/gulux';
import { Body, Controller, Get, Param, Post, Res, type HTTPResponse } from '@gulux/gulux/application-http';
import TaskService from '../services/taskService';
import { isTaskBriefValid, normalizeTaskBrief } from '../utils/taskValidator';

@Controller({ path: '/tasks' })
export default class TaskController {
  @Inject()
  private readonly taskService!: TaskService;

  @Get('')
  public listTasks() {
    return {
      items: this.taskService.listTasks(),
    };
  }

  @Get('/:taskId')
  public getTaskById(@Param('taskId') taskId: string) {
    return this.taskService.getTaskById(taskId);
  }

  @Post('')
  public createTask(@Body() body: unknown, @Res() res: HTTPResponse) {
    if (!isTaskBriefValid(body)) {
      throw Object.assign(new Error('invalid_task_payload'), { statusCode: 400 });
    }

    const task = this.taskService.createTask(normalizeTaskBrief(body));
    res.status = 201;
    return task;
  }

  @Post('/:taskId/run')
  public runTask(@Param('taskId') taskId: string) {
    return this.taskService.runTask(taskId);
  }
}
