import type { Task, TaskRepository } from '../types';
import type { TaskRunner } from '../agents/taskRunner';

interface RecoverRunningTasksOptions {
  taskRepository: TaskRepository;
  pickRunner: (task: Task) => Promise<TaskRunner>;
}

/**
 * 进程启动时扫描 running 任务，基于 LangGraph checkpoint 自动续跑。
 * fire-and-forget：失败只打日志，不能阻塞 HTTP 服务启动。
 */
export async function recoverRunningTasks({
  taskRepository,
  pickRunner,
}: RecoverRunningTasksOptions) {
  try {
    const tasks = await taskRepository.list();
    const running = tasks.filter((t) => t.status === 'running');
    if (running.length === 0) {
      return;
    }
    for (const task of running) {
      const runner = await pickRunner(task);
      runner.start(task._id);
    }
    console.info(`[taskRecovery] resumed ${running.length} running task(s)`);
  } catch (error) {
    console.error('[taskRecovery] failed to scan running tasks', error);
  }
}
