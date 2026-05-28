import { useRequest } from 'ahooks';
import { useShallow } from 'zustand/react/shallow';
import { createDefaultTaskBrief } from '../constants/task';
import { uploadAssets } from '../services/assetService';
import { createTask, runTask } from '../services/taskService';
import { useTaskWorkbenchStore } from '../store/taskWorkbenchStore';
import type { TaskBrief } from '../types';

interface UseCreateTaskOptions {
  refreshTasks: () => void;
  onCreated: (_id: string) => void;
}

export function useCreateTask({ refreshTasks, onCreated }: UseCreateTaskOptions) {
  const { draftTask, setDraftTask, createModalOpen, setCreateModalOpen } = useTaskWorkbenchStore(
    useShallow((state) => ({
      draftTask: state.draftTask,
      setDraftTask: state.setDraftTask,
      createModalOpen: state.createModalOpen,
      setCreateModalOpen: state.setCreateModalOpen,
    })),
  );
  const { loading, error, runAsync } = useRequest(
    async (files: File[]) => {
      const uploadedAssets = files.length > 0 ? (await uploadAssets(files)).items : [];
      const task = await createTask({
        ...draftTask,
        productImages: uploadedAssets,
      });
      await runTask(task._id);
      refreshTasks();
      onCreated(task._id);
      setDraftTask(createDefaultTaskBrief());
      setCreateModalOpen(false);
    },
    {
      manual: true,
    },
  );

  return {
    draftTask,
    setDraftTask: (nextDraftTask: TaskBrief) => setDraftTask(nextDraftTask),
    createModalOpen,
    setCreateModalOpen,
    submitting: loading,
    error: error instanceof Error ? error.message : null,
    createAndRunTask: runAsync,
  };
}
