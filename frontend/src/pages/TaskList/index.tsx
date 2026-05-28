import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Input, Row, Space, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import { AppShell } from '../../components/common/AppShell';
import { PageHero } from '../../components/common/PageHero';
import { CreateTaskModal } from '../../components/task/CreateTaskModal';
import { TaskListTable } from '../../components/task/TaskListTable';
import { TaskSummaryCards } from '../../components/task/TaskSummaryCards';
import { TaskStatus } from '../../constants/task';
import { useTaskWorkbench } from '../../hooks/useTaskWorkbench';
import type { TaskListQuery } from '../../types';
import { isTaskRunningStatus } from '../../utils/task';

const { Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;

interface TaskListFilterValues {
  _id?: string;
  productName?: string;
  createdAtRange?: [Dayjs, Dayjs] | null;
}

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
    loadTasks,
  } = useTaskWorkbench();
  const [filterForm] = Form.useForm<TaskListFilterValues>();

  const runningCount = tasks.filter((task) => isTaskRunningStatus(task.status)).length;
  const completedCount = tasks.filter((task) => task.status === TaskStatus.Completed).length;

  function buildTaskQuery(values: TaskListFilterValues): TaskListQuery {
    const dateRange = values.createdAtRange ?? null;

    return {
      _id: values._id?.trim() ?? '',
      productName: values.productName?.trim() ?? '',
      startDate: dateRange?.[0]?.startOf('day').toISOString(),
      endDate: dateRange?.[1]?.endOf('day').toISOString(),
    };
  }

  async function handleFilterSubmit(values: TaskListFilterValues) {
    await loadTasks(buildTaskQuery(values));
  }

  async function handleFilterReset() {
    filterForm.resetFields();
    await loadTasks({});
  }

  return (
    <AppShell
      header={
        <PageHero
          eyebrow="AIGC Content Agent"
          title="AIGC端到端的电商内容生成平台"
          description="管理电商带货内容任务，基于商品信息、商品图片和输入的 Prompt 快速生成完整的 Agent 生产链路。"
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
                  当前返回 {tasks.length} 个任务
                </Paragraph>
              }
            >
              <Form<TaskListFilterValues>
                form={filterForm}
                layout="vertical"
                onFinish={handleFilterSubmit}
                className="taskFilterForm"
              >
                <Row gutter={[16, 12]} align="bottom">
                  <Col xs={24} md={8}>
                    <Form.Item<TaskListFilterValues> label="任务 ID" name="_id" className="taskFilterItem">
                      <Input placeholder="输入任务 ID 模糊查询" allowClear />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item<TaskListFilterValues>
                      label="商品名称"
                      name="productName"
                      className="taskFilterItem"
                    >
                      <Input placeholder="输入商品名称模糊查询" allowClear />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item<TaskListFilterValues>
                      label="任务创建日期"
                      name="createdAtRange"
                      className="taskFilterItem"
                    >
                      <RangePicker
                        allowClear
                        className="taskFilterRange"
                        style={{ width: '100%' }}
                        placeholder={['开始日期', '结束日期']}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <div className="taskFilterActions">
                      <Space wrap>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                          查询
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={() => void handleFilterReset()}>
                          重置
                        </Button>
                      </Space>
                    </div>
                  </Col>
                </Row>
              </Form>
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

export default TaskListPage;
