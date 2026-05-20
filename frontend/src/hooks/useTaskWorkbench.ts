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
    activeTaskKey,
    setActiveTaskKey,
    activeTask,
    setActiveTask,
    createModalOpen,
    setCreateModalOpen,
    submitting,
    setSubmitting,
    error,
    setError,
  } = useTaskWorkbenchStore();
  const [pollingTaskKey, setPollingTaskKey] = useState<string | null>(null);
  const [taskFilters, setTaskFilters] = useState<FetchTasksParams>({});

  const stageCards = useMemo(() => {
    return activeTask?.stages ?? [];
  }, [activeTask]);

  async function loadTasks(nextFilters?: FetchTasksParams) {
    const resolvedFilters = nextFilters ?? taskFilters;
    const data = await fetchTasks(resolvedFilters);
    setTasks(data.items);
    setTaskFilters(resolvedFilters);
    const currentActiveTaskKey = useTaskWorkbenchStore.getState().activeTaskKey;

    if (!currentActiveTaskKey && data.items[0]) {
      setActiveTaskKey(data.items[0]._id);
    }
  }

  async function loadTask(_id: string) {
    const task = await fetchTask(_id);
    setActiveTask(task);
    setPollingTaskKey(isTaskTerminalStatus(task.status) ? null : task._id);

    const currentTasks = useTaskWorkbenchStore.getState().tasks;
    const hasTask = currentTasks.some((item) => item._id === task._id);

    if (!hasTask) {
      setTasks([task, ...currentTasks]);
      return;
    }

    setTasks(
      currentTasks.map((item) => {
        return item._id === task._id ? task : item;
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
      await runTask(task._id);
      await loadTasks();
      setActiveTaskKey(task._id);
      setPollingTaskKey(task._id);
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
  }, [setError]);

  useEffect(() => {
    if (!activeTaskKey) {
      setActiveTask(null);
      setPollingTaskKey(null);
      return;
    }

    setPollingTaskKey(activeTaskKey);

    loadTask(activeTaskKey).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : '加载任务详情失败');
    });
  }, [activeTaskKey, setActiveTask, setError]);

  useEffect(() => {
    if (!pollingTaskKey) {
      return;
    }

    const timer = window.setInterval(() => {
      loadTask(pollingTaskKey).catch(() => {});
    }, 1500);

    return () => window.clearInterval(timer);
  }, [pollingTaskKey]);

  return {
    draftTask,
    setDraftTask,
    tasks,
    activeTaskKey,
    setActiveTaskKey,
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
