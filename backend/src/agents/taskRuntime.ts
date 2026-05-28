import { getTaskGraphCheckpointer } from './taskGraph/checkpointer';
import { createImageTextTaskGraph } from './taskGraph/createImageTextTaskGraph';
import { createShortVideoTaskGraph } from './taskGraph/createShortVideoTaskGraph';
import { SupervisorAgent } from './Supervisor/supervisorAgent';
import { MongoTaskRepository } from '../repositories/taskRepository';
import type { Task } from '../types';

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
