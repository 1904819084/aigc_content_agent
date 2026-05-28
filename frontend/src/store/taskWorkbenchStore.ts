import { create } from 'zustand';
import { createDefaultTaskBrief } from '../constants/task';
import type { TaskBrief } from '../types';

interface TaskWorkbenchState {
  draftTask: TaskBrief;
  createModalOpen: boolean;
  setDraftTask: (draftTask: TaskBrief) => void;
  setCreateModalOpen: (open: boolean) => void;
}

export const useTaskWorkbenchStore = create<TaskWorkbenchState>((set) => ({
  draftTask: createDefaultTaskBrief(),
  createModalOpen: false,
  setDraftTask: (draftTask) => set({ draftTask }),
  setCreateModalOpen: (createModalOpen) => set({ createModalOpen }),
}));
