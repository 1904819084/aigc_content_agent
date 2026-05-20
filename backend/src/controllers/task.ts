import { Inject } from '@gulux/gulux';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  type HTTPResponse,
} from '@gulux/gulux/application-http';
import TaskService from '../services/taskService';
import type { TaskListQuery } from '../types';
import { AppError } from '../utils/appError';
import { isTaskBriefValid, normalizeTaskBrief } from '../utils/taskValidator';

@Controller({ path: '/tasks' })
export default class TaskController {
  @Inject()
  private readonly taskService!: TaskService;

  @Get('')
  public async listTasks(
    @Query('_id') _id?: string,
    @Query('productName') productName?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const query: TaskListQuery = {
      _id,
      productName,
      startDate,
      endDate,
    };

    return {
      items: await this.taskService.listTasks(query),
    };
  }

  @Get('/:_id')
  public getTaskById(@Param('_id') _id: string) {
    return this.taskService.getTaskById(_id);
  }

  @Post('')
  public async createTask(@Body() body: unknown, @Res() res: HTTPResponse) {
    if (!isTaskBriefValid(body)) {
      throw new AppError('invalid_task_payload', 400);
    }

    const task = await this.taskService.createTask(normalizeTaskBrief(body));
    res.status = 201;
    return task;
  }

  @Post('/:_id/run')
  public runTask(@Param('_id') _id: string) {
    return this.taskService.runTask(_id);
  }
}
