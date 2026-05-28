import { useRequest } from 'ahooks';
import { uploadAssets } from '../services/assetService';
import { createTask, runTask } from '../services/taskService';
import type { TaskBrief } from '../types';

interface UseCreateTaskOptions {
  refreshTasks: () => void;
  onCreated: (_id: string) => void;
}

export function useCreateTask({ refreshTasks, onCreated }: UseCreateTaskOptions) {
  const { loading, error, runAsync } = useRequest(
    async (input: Omit<TaskBrief, 'productImages'>, files: File[]) => {
      const uploadedAssets = files.length > 0 ? (await uploadAssets(files)).items : [];
      const task = await createTask({
        ...input,
        productImages: uploadedAssets,
      });
      await runTask(task._id);
      refreshTasks();
      onCreated(task._id);
    },
    {
      manual: true,
    },
  );

  return {
    submitting: loading,
    error: error instanceof Error ? error.message : null,
    createAndRunTask: runAsync,
  };
}