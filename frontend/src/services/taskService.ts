import { request } from './http';
import type { Task, TaskBrief } from '../types';

export async function fetchTasks() {
  return request<{ items: Task[] }>('/api/tasks');
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
