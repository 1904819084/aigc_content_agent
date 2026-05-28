import type { StageOutputMap, TaskStageName, TaskStageOutput } from '../types';

/**
 * 标准化阶段输出。`S` 收紧到具体 stageName 时，`output` 的形状由 StageOutputMap 强约束，
 * 上下游契约错配时会在编译期直接报错。
 */
export function createStageOutput<S extends TaskStageName>(
  stageName: S,
  data: {
    input: Record<string, unknown>;
    output: StageOutputMap[S];
  },
): TaskStageOutput<S> {
  return {
    stageName,
    generatedAt: new Date().toISOString(),
    input: data.input ?? {},
    output: data.output,
  } as TaskStageOutput<S>;
}
