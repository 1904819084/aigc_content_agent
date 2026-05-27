import type { CompiledStateGraph } from '@langchain/langgraph';
import { updateTaskStatus } from '../domain/task/taskPipeline';
import type { TaskRepository } from '../types';

export class TaskRunner {
  private readonly taskRepository: TaskRepository;
  private readonly taskGraph: CompiledStateGraph<any, any, any, any, any, any>;

  constructor(
    taskRepository: TaskRepository,
    taskGraph: CompiledStateGraph<any, any, any, any, any, any>,
  ) {
    this.taskRepository = taskRepository;
    this.taskGraph = taskGraph;
  }

  start(_id: string) {
    void this.runTaskGraph(_id);
  }

  /**
   * 启动或续跑任务图：
   * - 若该 thread 已有 checkpoint（崩溃续跑场景），传 null 让 LangGraph 从最近一次 superstep 恢复；
   * - 否则按 fresh start 传入初始 state。
   * 同一任务复用 thread_id = _id，保证回溯/重试落在同一时间线。
   */
  async runTaskGraph(_id: string) {
    const task = await this.taskRepository.findById(_id);

    if (!task) {
      return;
    }

    const config = { configurable: { thread_id: _id } };

    try {
      const existingState = await this.taskGraph.getState(config);
      const hasCheckpoint = Boolean(existingState?.config?.configurable?.checkpoint_id);
      const input = hasCheckpoint ? null : { _id };

      await this.taskGraph.invoke(input, config);

      const latestTask = await this.taskRepository.findById(_id);
      if (!latestTask) {
        return;
      }
      await this.taskRepository.save(updateTaskStatus(latestTask, 'completed', null));
    } catch {
      const latestTask = await this.taskRepository.findById(_id);
      if (!latestTask) {
        return;
      }
      await this.taskRepository.save(updateTaskStatus(latestTask, 'failed', latestTask.currentStage));
    }
  }
}
