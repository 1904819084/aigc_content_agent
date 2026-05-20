import { useEffect, useMemo, useState } from 'react';
import { createDefaultTaskBrief } from '../constants/task';
import { uploadAssets } from '../services/assetService';
import { createTask, fetchTask, fetchTasks, runTask, type FetchTasksParams } from '../services/taskService';
import { useTaskWorkbenchStore } from '../store/taskWorkbenchStore';
import { isTaskTerminalStatus } from '../utils/task';

export function useTaskWorkbench() {
  const {
    draftTask,
    setDraftTask,
    tasks,
    setTasks,
    activeTaskId,
    setActiveTaskId,
    activeTask,
    setActiveTask,
    createModalOpen,
    setCreateModalOpen,
    submitting,
    setSubmitting,
    error,
    setError,
  } = useTaskWorkbenchStore();
  const [pollingTaskId, setPollingTaskId] = useState<string | null>(null);
  const [taskFilters, setTaskFilters] = useState<FetchTasksParams>({});

  const stageCards = useMemo(() => {
    return activeTask?.stages ?? [];
  }, [activeTask]);

  async function loadTasks(nextFilters?: FetchTasksParams) {
    const resolvedFilters = nextFilters ?? taskFilters;
    const data = await fetchTasks(resolvedFilters);
    setTasks(data.items);
    setTaskFilters(resolvedFilters);
    const currentActiveTaskId = useTaskWorkbenchStore.getState().activeTaskId;

    if (!currentActiveTaskId && data.items[0]) {
      setActiveTaskId(data.items[0].id);
    }
  }

  async function loadTask(taskId: string) {
    const task = await fetchTask(taskId);
    setActiveTask(task);
    setPollingTaskId(isTaskTerminalStatus(task.status) ? null : task.id);

    const currentTasks = useTaskWorkbenchStore.getState().tasks;
    const hasTask = currentTasks.some((item) => item.id === task.id);

    if (!hasTask) {
      setTasks([task, ...currentTasks]);
      return;
    }

    setTasks(
      currentTasks.map((item) => {
        return item.id === task.id ? task : item;
      }),
    );
  }

  async function createAndRunTask(files: File[]) {
    setSubmitting(true);
    setError(null);

    try {
      const uploadedAssets = files.length > 0 ? (await uploadAssets(files)).items : [];
      const task = await createTask({
        ...draftTask,
        productImages: uploadedAssets,
      });
      await runTask(task.id);
      await loadTasks();
      setActiveTaskId(task.id);
      setPollingTaskId(task.id);
      setDraftTask(createDefaultTaskBrief());
      setCreateModalOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '创建任务失败');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadTasks().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : '加载任务失败');
    });
  }, []);

  useEffect(() => {
    if (!activeTaskId) {
      setActiveTask(null);
      setPollingTaskId(null);
      return;
    }

    setPollingTaskId(activeTaskId);

    loadTask(activeTaskId).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : '加载任务详情失败');
    });
  }, [activeTaskId]);

  useEffect(() => {
    if (!pollingTaskId) {
      return;
    }

    const timer = window.setInterval(() => {
      loadTask(pollingTaskId).catch(() => {});
    }, 1500);

    return () => window.clearInterval(timer);
  }, [pollingTaskId]);

  return {
    draftTask,
    setDraftTask,
    tasks,
    activeTaskId,
    setActiveTaskId,
    activeTask,
    stageCards,
    createModalOpen,
    setCreateModalOpen,
    submitting,
    error,
    taskFilters,
    setTaskFilters,
    loadTasks,
    loadTask,
    createAndRunTask,
  };
}
