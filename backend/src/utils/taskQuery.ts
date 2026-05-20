import type { Task } from '../types';

// 判断任务创建时间是否命中查询日期范围
export function isTaskWithinDateRange(task: Task, startDate: string, endDate: string) {
  if (!startDate && !endDate) {
    return true;
  }

  const createdAt = new Date(task.createdAt).getTime();

  if (Number.isNaN(createdAt)) {
    return false;
  }

  if (startDate) {
    const startTime = new Date(startDate).getTime();

    if (Number.isNaN(startTime) || createdAt < startTime) {
      return false;
    }
  }

  if (endDate) {
    const endTime = new Date(endDate).getTime();

    if (Number.isNaN(endTime) || createdAt > endTime) {
      return false;
    }
  }

  return true;
}
