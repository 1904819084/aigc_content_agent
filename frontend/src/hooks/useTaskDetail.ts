import { useRequest } from 'ahooks';
import { fetchTask } from '../services/taskService';
import { isTaskTerminalStatus } from '../utils/task';

export function useTaskDetail(taskId?: string) {
  const { data, error, refresh, cancel } = useRequest(() => fetchTask(taskId!), {
    ready: Boolean(taskId),
    refreshDeps: [taskId],
    pollingInterval: 1500,
    pollingWhenHidden: false,
    onSuccess: (task) => {
      if (isTaskTerminalStatus(task.status)) {
        cancel();
      }
    },
  });


  return {
    data,
    error: error instanceof Error ? error.message : null,
    refresh,
  };
}
