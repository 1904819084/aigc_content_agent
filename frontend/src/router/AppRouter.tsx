import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { TaskStageStatus } from '../constants/task';
import { StatusIcon } from '../components/common/StatusIcon';

const TaskListPage = lazy(async () => {
  const module = await import('../pages/task-list/TaskListPage');
  return { default: module.TaskListPage };
});

const TaskDetailPage = lazy(async () => {
  const module = await import('../pages/task-detail/TaskDetailPage');
  return { default: module.TaskDetailPage };
});

export function AppRouter() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense
        fallback={
          <div className="routeLoading">
            <Spin size="large" indicator={<StatusIcon status={TaskStageStatus.Running} size={30} />} />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<TaskListPage />} />
          <Route path="/tasks/:_id" element={<TaskDetailPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
