import { getTaskGraphCheckpointer } from '../agents/taskGraph/checkpointer';
import { createImageTextTaskGraph } from '../agents/taskGraph/createImageTextTaskGraph';
import { createShortVideoTaskGraph } from '../agents/taskGraph/createShortVideoTaskGraph';
import { SupervisorAgent } from '../agents/Supervisor/supervisorAgent';
import { MongoTaskRepository } from '../data/mongoTaskRepository';
import type { Task } from '../types';

// 任务运行时单例：repository + 两条 graph 的 supervisor 通过 thread_id 共享 checkpointer。
// 抽离到独立模块便于 service 与 bootstrap 共享，避免循环依赖与重复实例化。
export const taskRepository = new MongoTaskRepository();

let supervisorsPromise: Promise<{
  shortVideoSupervisor: SupervisorAgent;
  imageTextSupervisor: SupervisorAgent;
}> | null = null;

function getSupervisors() {
  if (!supervisorsPromise) {
    supervisorsPromise = (async () => {
      const checkpointer = await getTaskGraphCheckpointer();
      const shortVideoTaskGraph = createShortVideoTaskGraph(taskRepository, checkpointer);
      const imageTextTaskGraph = createImageTextTaskGraph(taskRepository, checkpointer);
      return {
        shortVideoSupervisor: new SupervisorAgent(taskRepository, shortVideoTaskGraph),
        imageTextSupervisor: new SupervisorAgent(taskRepository, imageTextTaskGraph),
      };
    })();
  }
  return supervisorsPromise;
}

export async function pickSupervisor(task: Task): Promise<SupervisorAgent> {
  const supervisors = await getSupervisors();
  return task.brief.taskType === 'image_text'
    ? supervisors.imageTextSupervisor
    : supervisors.shortVideoSupervisor;
}
