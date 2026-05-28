import { Inject, Injectable } from '@gulux/gulux';
import type { Task } from '../../types';
import { MongoTaskRepository } from '../../repositories/taskRepository';
import { getTaskGraphCheckpointer } from '../taskGraph/checkpointer';
import { createImageTextTaskGraph } from '../taskGraph/createImageTextTaskGraph';
import { createShortVideoTaskGraph } from '../taskGraph/createShortVideoTaskGraph';
import { SupervisorAgent } from './supervisorAgent';

interface SupervisorBundle {
  shortVideoSupervisor: SupervisorAgent;
  imageTextSupervisor: SupervisorAgent;
}

/**
 * 把 SupervisorAgent 的 lazy async 初始化（依赖 Mongo checkpointer）
 * 包进一个 Injectable，对外仍暴露同步构造的 IoC 单例。
 */
@Injectable()
export class SupervisorRuntime {
  @Inject()
  private readonly taskRepository!: MongoTaskRepository;

  private supervisorsPromise: Promise<SupervisorBundle> | null = null;

  public async pick(task: Task): Promise<SupervisorAgent> {
    const supervisors = await this.getSupervisors();
    return task.brief.taskType === 'image_text'
      ? supervisors.imageTextSupervisor
      : supervisors.shortVideoSupervisor;
  }

  private getSupervisors(): Promise<SupervisorBundle> {
    if (!this.supervisorsPromise) {
      this.supervisorsPromise = this.buildSupervisors();
    }
    return this.supervisorsPromise;
  }

  private async buildSupervisors(): Promise<SupervisorBundle> {
    const checkpointer = await getTaskGraphCheckpointer();
    const shortVideoTaskGraph = createShortVideoTaskGraph(this.taskRepository, checkpointer);
    const imageTextTaskGraph = createImageTextTaskGraph(this.taskRepository, checkpointer);
    return {
      shortVideoSupervisor: new SupervisorAgent(this.taskRepository, shortVideoTaskGraph),
      imageTextSupervisor: new SupervisorAgent(this.taskRepository, imageTextTaskGraph),
    };
  }
}
