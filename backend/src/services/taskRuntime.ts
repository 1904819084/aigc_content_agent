import { getTaskGraphCheckpointer } from '../agents/taskGraph/checkpointer';
import { createImageTextTaskGraph } from '../agents/taskGraph/createImageTextTaskGraph';
import { createShortVideoTaskGraph } from '../agents/taskGraph/createShortVideoTaskGraph';
import { TaskRunner } from '../agents/taskRunner';
import { MongoTaskRepository } from '../data/mongoTaskRepository';
import type { Task } from '../types';

// 任务运行时单例：repository + 两条 graph 的 runner 通过 thread_id 共享 checkpointer。
// 抽离到独立模块便于 service 与 bootstrap 共享，避免循环依赖与重复实例化。
export const taskRepository = new MongoTaskRepository();

let runnersPromise: Promise<{
  shortVideoTaskRunner: TaskRunner;
  imageTextTaskRunner: TaskRunner;
}> | null = null;

function getTaskRunners() {
  if (!runnersPromise) {
    runnersPromise = (async () => {
      const checkpointer = await getTaskGraphCheckpointer();
      const shortVideoTaskGraph = createShortVideoTaskGraph(taskRepository, checkpointer);
      const imageTextTaskGraph = createImageTextTaskGraph(taskRepository, checkpointer);
      return {
        shortVideoTaskRunner: new TaskRunner(taskRepository, shortVideoTaskGraph),
        imageTextTaskRunner: new TaskRunner(taskRepository, imageTextTaskGraph),
      };
    })();
  }
  return runnersPromise;
}

export async function pickRunner(task: Task): Promise<TaskRunner> {
  const runners = await getTaskRunners();
  return task.brief.taskType === 'image_text'
    ? runners.imageTextTaskRunner
    : runners.shortVideoTaskRunner;
}
