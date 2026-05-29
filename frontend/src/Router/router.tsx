import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StatusIcon } from '../components/common/StatusIcon';
import { TaskStageStatus } from '../constants/task';

const TaskListPage = lazy(() => import('../pages/TaskList/index'));
const TaskDetailPage = lazy(() => import('../pages/TaskDetail/index'));
const SubAgentListPage = lazy(() => import('../pages/SubAgentList/index'));
const SubAgentDetailPage = lazy(() => import('../pages/SubAgentDetail/index'));

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
          <Route path="/subagents" element={<SubAgentListPage />} />
          <Route path="/subagents/:name" element={<SubAgentDetailPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
