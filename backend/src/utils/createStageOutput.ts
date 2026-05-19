import { TaskStageName, TaskStageOutput } from "../types";

// 标准化各阶段输出
export function createStageOutput(stageName: TaskStageName, data: TaskStageOutput) {
  return {
    stageName,
    version: 'v1',
    generatedAt: new Date().toISOString(),
    input: data.input ?? {},
    output: data.output ?? null,
  };
}
