import type { CompiledStateGraph } from '@langchain/langgraph';
import { updateTaskStatus } from '../../domain/task/taskPipeline';
import type { TaskRepository } from '../../types';

/**
 * SupervisorAgent
 * ----------------
 * 任务运行时的唯一入口，负责调度 stage 节点对应的 SubAgent。
 * 仅承担两件事：fresh start 与崩溃续跑。SubAgent 不感知调度策略，保持单一职责。
 *
 * thread_id 复用 task._id：fresh start / 进程崩溃后的自动续跑都落在同一时间线，
 * LangGraph checkpointer 自动从最近一次 superstep 恢复。
 *
 * 暂不支持用户主动 retry / cancel / 人工审核：等真有需求再在此层叠加，
 * 避免提前抽象造成的负向 ROI。
 */
export class SupervisorAgent {
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
