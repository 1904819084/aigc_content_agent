import { recoverRunningTasks } from '../services/recoverRunningTasks';
import { pickSupervisor, taskRepository } from '../services/taskRuntime';

// 进程启动副作用入口：扫描 running 任务并基于 LangGraph checkpoint 续跑。
// fire-and-forget，HTTP 服务不会因恢复失败而阻塞。
void recoverRunningTasks({ taskRepository, pickSupervisor });
