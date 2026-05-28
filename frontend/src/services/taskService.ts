import { request } from './http';
import type { Task, TaskBrief, TaskListQuery } from '../types';

export async function fetchTasks(params?: TaskListQuery) {
  return request<{ items: Task[] }>('/api/tasks', {
    params,
  });
}

export async function fetchTask(_id: string) {
  return request<Task>(`/api/tasks/${_id}`);
}

export async function createTask(brief: TaskBrief) {
  return request<Task>('/api/tasks', {
    method: 'POST',
    data: brief,
  });
}

export async function runTask(_id: string) {
  return request<Task>(`/api/tasks/${_id}/run`, {
    method: 'POST',
  });
}
