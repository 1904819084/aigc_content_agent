import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Typography } from 'antd';
import { AppShell } from '../../components/common/AppShell';
import { PageHero } from '../../components/layout/PageHero';
import { CreateTaskModal } from '../../components/task/CreateTaskModal';
import { TaskListTable } from '../../components/task/TaskListTable';
import { TaskSummaryCards } from '../../components/task/TaskSummaryCards';
import { TaskStatus } from '../../constants/task';
import { useTaskWorkbench } from '../../hooks/useTaskWorkbench';
import { isTaskRunningStatus } from '../../utils/task';

const { Paragraph, Text } = Typography;

export function TaskListPage() {
  const {
    draftTask,
    setDraftTask,
    tasks,
    createModalOpen,
    setCreateModalOpen,
    submitting,
    error,
    createAndRunTask,
  } = useTaskWorkbench();

  const runningCount = tasks.filter((task) => isTaskRunningStatus(task.status)).length;
  const completedCount = tasks.filter((task) => task.status === TaskStatus.Completed).length;

  return (
    <AppShell
      header={
        <PageHero
          eyebrow="AIGC Short Video Agent"
          title="短视频任务中心"
          description="管理电商带货短视频任务，基于商品信息、商品图片和补充 Prompt 快速生成完整的 Agent 生产链路。"
          actions={
            <Space style={{ marginTop: 20 }} wrap>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
              >
                创建任务
              </Button>
            </Space>
          }
          extra={
            <div className="heroHighlightCard">
              <Text className="heroHighlightLabel">任务运行概览</Text>
              <div className="heroHighlightStats">
                <div>
                  <div className="heroHighlightValue">{tasks.length}</div>
                  <div className="heroHighlightHint">任务总数</div>
                </div>
                <div>
                  <div className="heroHighlightValue">{runningCount}</div>
                  <div className="heroHighlightHint">执行中</div>
                </div>
                <div>
                  <div className="heroHighlightValue">{completedCount}</div>
                  <div className="heroHighlightHint">已完成</div>
                </div>
              </div>
              <Paragraph className="heroHighlightDesc">
                用任务中心统一追踪从剧本到质检的 Agent 流程，聚焦当前瓶颈与完成效率。
              </Paragraph>
            </div>
          }
        />
      }
      mainClassName="taskCenterLayout"
    >
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <TaskSummaryCards tasks={tasks} />
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              variant="borderless"
              className="taskSectionCard"
              title="任务列表"
              extra={
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  共 {tasks.length} 个任务
                </Paragraph>
              }
            >
              <TaskListTable tasks={tasks} loading={submitting && tasks.length === 0} />
            </Card>
          </Col>
        </Row>
      </Space>
      <CreateTaskModal
        open={createModalOpen}
        draftTask={draftTask}
        submitting={submitting}
        error={error}
        onCancel={() => setCreateModalOpen(false)}
        onChange={setDraftTask}
        onSubmit={createAndRunTask}
      />
    </AppShell>
  );
}
