import { LifecycleHook, LifecycleHookUnit } from '@gulux/gulux';
import type Container from '@artus/injection/lib/container';
import { SupervisorRuntime } from '../agents/Supervisor/supervisorRuntime';
import { MongoTaskRepository } from '../repositories/taskRepository';
import { recoverRunningTasks } from '../services/taskRecoveryService';

interface DidReadyHookProps {
  app: { container: Container };
}

@LifecycleHookUnit()
export default class ApplicationBootstrap {
  @LifecycleHook('didReady')
  public async didReady({ app }: DidReadyHookProps) {
    const taskRepository = app.container.get(MongoTaskRepository);
    const supervisorRuntime = app.container.get(SupervisorRuntime);

    void recoverRunningTasks({
      taskRepository,
      pickSupervisor: (task) => supervisorRuntime.pick(task),
    });
  }
}
