import type { Task, TaskRepository } from '../types';
import type { SupervisorAgent } from '../agents/Supervisor/supervisorAgent';

interface RecoverRunningTasksOptions {
  taskRepository: TaskRepository;
  pickSupervisor: (task: Task) => Promise<SupervisorAgent>;
}

/**
 * 进程启动时扫描 running 任务，基于 LangGraph checkpoint 自动续跑。
 * fire-and-forget：失败只打日志，不能阻塞 HTTP 服务启动。
 */
export async function recoverRunningTasks({
  taskRepository,
  pickSupervisor,
}: RecoverRunningTasksOptions) {
  try {
    const tasks = await taskRepository.list();
    const running = tasks.filter((t) => t.status === 'running');
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
