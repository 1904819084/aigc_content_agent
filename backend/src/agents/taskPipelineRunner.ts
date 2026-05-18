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

  start(taskId: string) {
    void this.runTaskGraph(taskId);
  }

  async runTaskGraph(taskId: string) {
    const task = this.taskRepository.findById(taskId);

    if (!task) {
      return;
    }

    try {
      await this.taskGraph.invoke({
        taskId,
        currentStage: null,
        error: null,
      });

      const latestTask = this.taskRepository.findById(taskId);

      if (!latestTask) {
        return;
      }

      this.taskRepository.save(updateTaskStatus(latestTask, 'completed', null));
    } catch {
      const latestTask = this.taskRepository.findById(taskId);

      if (!latestTask) {
        return;
      }

      this.taskRepository.save(updateTaskStatus(latestTask, 'failed', latestTask.currentStage));
    }
  }
}

