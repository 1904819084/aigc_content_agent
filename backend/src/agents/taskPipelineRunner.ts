import type { CompiledStateGraph } from '@langchain/langgraph';
import { updateTaskStatus } from '../domain/task/taskPipeline';
import type { TaskRepository } from '../types';

export class TaskPipelineRunner {
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

  async runTaskGraph(_id: string) {
    const task = await this.taskRepository.findById(_id);

    if (!task) {
      return;
    }

    try {
      await this.taskGraph.invoke({
        _id,
        currentStage: null,
        error: null,
      });

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
