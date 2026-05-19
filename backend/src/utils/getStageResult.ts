import type { Task, TaskStageName } from '../types';
import { AppError } from './appError';

// 获取任务指定阶段的输出结果
export function getStageResult<T = any>(task: Task, stageName: TaskStageName): T {
  const stageOutput = task.outputs?.[stageName];
  if (!stageOutput) {
    throw new AppError(`missing_stage_output:${stageName}`, 400);
  }
  return stageOutput.output as T;
}
