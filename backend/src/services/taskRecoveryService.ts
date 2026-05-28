import type { Task, TaskRepository } from '../types';
import type { SupervisorAgent } from '../agents/Supervisor/supervisorAgent';

interface RecoverRunningTasksOptions {
  taskRepository: TaskRepository;
  pickSupervisor: (task: Task) => Promise<SupervisorAgent>;
}

export async function recoverRunningTasks({
  taskRepository,
  pickSupervisor,
}: RecoverRunningTasksOptions) {
  try {
    const tasks = await taskRepository.list();
    const running = tasks.filter((task) => task.status === 'running');
    if (running.length === 0) {
      return;
    }
    for (const task of running) {
      const supervisor = await pickSupervisor(task);
      supervisor.start(task._id);
    }
    console.info(`[taskRecovery] resumed ${running.length} running task(s)`);
  } catch (error) {
    console.error('[taskRecovery] failed to scan running tasks', error);
  }
}
