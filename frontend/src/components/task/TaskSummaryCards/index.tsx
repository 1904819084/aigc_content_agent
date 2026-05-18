import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';
import { TaskStatus } from '../../../constants/task';
import type { Task } from '../../../types';
import { isTaskRunningStatus } from '../../../utils/task';
import styles from './index.module.less';

const { Paragraph, Text } = Typography;

interface TaskSummaryCardsProps {
  tasks: Task[];
}

export function TaskSummaryCards(props: TaskSummaryCardsProps) {
  const { tasks } = props;

  const completedCount = tasks.filter((task) => task.status === TaskStatus.Completed).length;
  const runningCount = tasks.filter((task) => isTaskRunningStatus(task.status)).length;
  const pendingCount = tasks.filter((task) => task.status === TaskStatus.Pending).length;

  const metricItems = [
    {
      title: '任务总数',
      value: tasks.length,
      hint: '当前任务池规模',
      icon: <RocketOutlined />,
      className: styles.metricPrimary,
    },
    {
      title: '运行中任务',
      value: runningCount,
      hint: 'Agent 正在推进',
      icon: <PlayCircleOutlined />,
      className: styles.metricAccent,
    },
    {
      title: '已完成任务',
      value: completedCount,
      hint: '可进入复盘审阅',
      icon: <CheckCircleOutlined />,
      className: styles.metricSuccess,
    },
    {
      title: '待处理任务',
      value: pendingCount,
      hint: '等待进入执行阶段',
      icon: <ClockCircleOutlined />,
      className: styles.metricMuted,
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {metricItems.map((item) => (
        <Col key={item.title} xs={24} md={12} xl={6}>
          <Card variant="borderless" className={[styles.metricCard, item.className].join(' ')}>
            <div className={styles.metricCardInner}>
              <div className={styles.metricIcon}>{item.icon}</div>
              <div>
                <Text className={styles.metricLabel}>{item.title}</Text>
                <div className={styles.metricValue}>{item.value}</div>
                <Paragraph className={styles.metricHint}>{item.hint}</Paragraph>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
