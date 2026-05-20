import type { TaskStageName, TaskStageOutput } from '../types';

type StageOutputData = Pick<TaskStageOutput, 'input' | 'output'>;

// 标准化各阶段输出
export function createStageOutput(stageName: TaskStageName, data: StageOutputData) {
  return {
    stageName,
    version: 'v1',
    generatedAt: new Date().toISOString(),
    input: data.input ?? {},
    output: data.output ?? null,
  };
}
