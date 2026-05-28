import { recoverRunningTasks } from '../services/taskRecoveryService';
import { pickSupervisor, taskRepository } from '../agents/taskRuntime';

let hasBootstrapped = false;

export function bootstrapApplication() {
  if (hasBootstrapped) {
    return;
  }

  hasBootstrapped = true;
  void recoverRunningTasks({ taskRepository, pickSupervisor });
}
