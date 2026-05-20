import { request } from './http';
import type { Task, TaskBrief } from '../types';

export interface FetchTasksParams {
  taskId?: string;
  productName?: string;
  startDate?: string;
  endDate?: string;
}

export async function fetchTasks(params?: FetchTasksParams) {
  return request<{ items: Task[] }>('/api/tasks', {
    params,
  });
}

export async function fetchTask(taskId: string) {
  return request<Task>(`/api/tasks/${taskId}`);
}

export async function createTask(brief: TaskBrief) {
  return request<Task>('/api/tasks', {
    method: 'POST',
    data: brief,
  });
}

export async function runTask(taskId: string) {
  return request<Task>(`/api/tasks/${taskId}/run`, {
    method: 'POST',
  });
}
