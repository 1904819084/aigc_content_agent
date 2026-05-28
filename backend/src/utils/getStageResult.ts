import type { StageOutputMap, Task, TaskStageName } from '../types';
import { AppError } from './appError';

/**
 * 获取任务指定阶段的输出结果。
 * 通过 StageOutputMap 把 stageName 映射到精确 output 类型，调用方不再需要手写 `as T` 断言。
 */
export function getStageResult<S extends TaskStageName>(task: Task, stageName: S): StageOutputMap[S] {
  const stageOutput = task.outputs?.[stageName];
  if (!stageOutput) {
    throw new AppError(`missing_stage_output:${stageName}`, 400);
  }
  return stageOutput.output as StageOutputMap[S];
}
