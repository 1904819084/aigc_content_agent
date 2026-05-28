/**
 * 后端 types：纯前后端共享契约直接 re-export 自 @aigc/shared，
 * 仅保留后端独有的 Repository 接口。新增类型时区分清楚归属：
 *  - 前后端都关心 → 放 shared
 *  - 仅后端持久化/服务接口 → 留这里
 */

export type {
  AssetResource,
  EditingResult,
  ImageGeneratingResult,
  ImagePromptGeneratingResult,
  QaReviewDecision,
  QaReviewResult,
  QaReviewTargetStage,
  ScriptResult,
  ScriptSection,
  StageOutputMap,
  StoryboardShotResult,
  Task,
  TaskBrief,
  TaskListQuery,
  TaskStage,
  TaskStageName,
  TaskStageOutput,
  TaskStageStatus,
  TaskStatus,
  TaskType,
  UploadedAssetFile,
  VideoGeneratingResult,
  VideoPromptGeneratingResult,
} from '@aigc/shared';

import type { AssetResource, Task, TaskStageName, TaskStageOutput } from '@aigc/shared';

export interface TaskRepository {
  list(): Promise<Task[]>;
  findById(_id: string): Promise<Task | null>;
  save(task: Task): Promise<Task>;
  markStageRunning(_id: string, stageName: TaskStageName): Promise<Task | null>;
  markStageCompleted<S extends TaskStageName>(
    _id: string,
    stageName: S,
    output: TaskStageOutput<S>,
  ): Promise<Task | null>;
  markStageFailed(_id: string, stageName: TaskStageName, errorMessage: string): Promise<Task | null>;
  // QA 失败回溯：累加 QA 阶段 attempts
  incrementStageAttempts(_id: string, stageName: TaskStageName): Promise<Task | null>;
  // QA 失败回溯：把指定阶段及其下游已完成阶段重置为 pending，清掉 outputs，方便 graph 重新执行
  resetStagesFrom(_id: string, stageNames: TaskStageName[]): Promise<Task | null>;
}

export interface AssetRepository {
  list(): Promise<AssetResource[]>;
  saveMany(assets: AssetResource[]): Promise<AssetResource[]>;
}
