import { useRequest } from 'ahooks';
import { useState } from 'react';
import { fetchTasks } from '../services/taskService';
import type { TaskListQuery } from '../types';

export function useTaskList(initialFilters: TaskListQuery = {}) {
  const [filters, setFilters] = useState<TaskListQuery>(initialFilters);
  const { data, loading, error, refresh } = useRequest(() => fetchTasks(filters), {
    refreshDeps: [filters],
  });

  return {
    tasks: data?.items ?? [],
    loading,
    error: error instanceof Error ? error.message : null,
    filters,
    setFilters,
    refresh,
  };
}