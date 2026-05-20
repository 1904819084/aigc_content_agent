import { create } from 'zustand';
import { createDefaultTaskBrief } from '../constants/task';
import type { Task, TaskBrief } from '../types';

interface TaskWorkbenchState {
  draftTask: TaskBrief;
  tasks: Task[];
  activeTaskKey: string | null;
  activeTask: Task | null;
  createModalOpen: boolean;
  submitting: boolean;
  error: string | null;
  setDraftTask: (draftTask: TaskBrief) => void;
  setTasks: (tasks: Task[]) => void;
  setActiveTaskKey: (_id: string | null) => void;
  setActiveTask: (task: Task | null) => void;
  setCreateModalOpen: (open: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTaskWorkbenchStore = create<TaskWorkbenchState>((set) => ({
  draftTask: createDefaultTaskBrief(),
  tasks: [],
  activeTaskKey: null,
  activeTask: null,
  createModalOpen: false,
  submitting: false,
  error: null,
  setDraftTask: (draftTask) => set({ draftTask }),
  setTasks: (tasks) => set({ tasks }),
  setActiveTaskKey: (activeTaskKey) => set({ activeTaskKey }),
  setActiveTask: (activeTask) => set({ activeTask }),
  setCreateModalOpen: (createModalOpen) => set({ createModalOpen }),
  setSubmitting: (submitting) => set({ submitting }),
  setError: (error) => set({ error }),
}));
