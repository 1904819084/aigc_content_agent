import { ArrowLeftOutlined, CalendarOutlined, RocketOutlined } from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Empty, Row, Space, Tag, Typography } from 'antd';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppShell } from '../../components/common/AppShell';
import { ImageList } from '../../components/common/ImageList';
import { PageHero } from '../../components/common/PageHero';
import { StatusTag } from '../../components/common/StatusTag';
import { TaskStagePanel } from '../../components/task/TaskStagePanel';
import { TASK_STATUS_TAG_COLOR_MAP, TASK_TYPE_LABELS, TaskType } from '../../constants/task';
import { useTaskWorkbench } from '../../hooks/useTaskWorkbench';
import { getTaskCurrentStageLabel, getTaskStatusLabel } from '../../utils/task';

const { Paragraph, Text } = Typography;

export function TaskDetailPage() {
  const { _id } = useParams();
  const { tasks, activeTask, setActiveTaskKey } = useTaskWorkbench();

  const currentTask =
    activeTask?._id === _id ? activeTask : (tasks.find((task) => task._id === _id) ?? null);

  useEffect(() => {
    if (_id) {
      setActiveTaskKey(_id);
    }
  }, [_id, setActiveTaskKey]);

  return (
    <AppShell
      header={
        <PageHero
          eyebrow="Task Detail"
          title={currentTask?.name ?? '任务详情'}
          description="查看商品信息、商品素材与每个 Agent 阶段的结构化输出，跟踪带货短视频生产进度。"
          compact
          actions={
            <Space style={{ marginTop: 16 }}>
              <Link to="/">
                <Button icon={<ArrowLeftOutlined />}>返回任务列表</Button>
              </Link>
            </Space>
          }
          extra={
            currentTask ? (
              <div className="heroHighlightCard compactHighlight">
                <Text className="heroHighlightLabel">当前任务状态</Text>
                <div className="heroStatusRow">
                  <StatusTag
                    status={currentTask.status}
                    color={TASK_STATUS_TAG_COLOR_MAP[currentTask.status]}
                    className="heroStatusTag"
                  >
                    {getTaskStatusLabel(currentTask.status)}
                  </StatusTag>
                  <Text className="heroHighlightHint">
                    当前阶段：{getTaskCurrentStageLabel(currentTask)}
                  </Text>
                </div>
                <Paragraph className="heroHighlightDesc">
                  创建于 {new Date(currentTask.createdAt).toLocaleString('zh-CN')}
                </Paragraph>
              </div>
            ) : null
          }
        />
      }
      mainClassName="singleColumnLayout"
    >
      {!currentTask ? (
        <Card variant="borderless" className="taskSectionCard">
          <Empty description="任务不存在或仍在加载中" />
        </Card>
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Row gutter={[16, 16]} align="stretch" className="taskOverviewRow">
            <Col xs={24} xl={10}>
              <Card variant="borderless" className="taskSectionCard taskOverviewCard" title="任务概览">
                <Descriptions
                  column={1}
                  items={[
                    {
                      key: 'productName',
                      label: '商品名',
                      children: currentTask.brief.productName || currentTask.name,
                    },
                    {
                      key: 'taskType',
                      label: '任务类型',
                      children: (() => {
                        const taskType = currentTask.brief.taskType ?? TaskType.ShortVideo;
                        return (
                          <Tag color={taskType === TaskType.ImageText ? 'geekblue' : 'purple'}>
                            {TASK_TYPE_LABELS[taskType]}
                          </Tag>
                        );
                      })(),
                    },
                    {
                      key: 'productImages',
                      label: '商品图片',
                      children: <ImageList images={currentTask.brief.productImages} />,
                    },
                    {
                      key: 'inputPrompt',
                      label: '输入的 Prompt',
                      children: currentTask.brief.inputPrompt || '未填写',
                    },
                    {
                      key: '_id',
                      label: '任务 ID',
                      children: currentTask._id,
                    },
                  ]}
                />
              </Card>
            </Col>
            <Col xs={24} xl={14}>
              <Card variant="borderless" className="taskSectionCard taskOverviewCard" title="执行状态">
                <Space direction="vertical" size={14} style={{ width: '100%' }}>
                  <Space align="center" size={12}>
                    <StatusTag status={currentTask.status} color={TASK_STATUS_TAG_COLOR_MAP[currentTask.status]}>
                      {getTaskStatusLabel(currentTask.status)}
                    </StatusTag>
                    <Text type="secondary">
                      <RocketOutlined /> 当前阶段：
                      {getTaskCurrentStageLabel(currentTask)}
                    </Text>
                  </Space>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    <CalendarOutlined /> 创建时间：
                    {new Date(currentTask.createdAt).toLocaleString('zh-CN')}
                  </Paragraph>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    最近更新时间：{new Date(currentTask.updatedAt).toLocaleString('zh-CN')}
                  </Paragraph>
                </Space>
              </Card>
            </Col>
          </Row>
          <TaskStagePanel task={currentTask} />
        </Space>
      )}
    </AppShell>
  );
}
