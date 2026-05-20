import { EyeOutlined } from '@ant-design/icons';
import { Button, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { TASK_STATUS_TAG_COLOR_MAP } from '../../../constants/task';
import type { Task } from '../../../types';
import { getTaskStatusLabel } from '../../../utils/task';
import { ImageList } from '../../common/ImageList';
import { StatusTag } from '../../common/StatusTag';
import styles from './index.module.less';

const { Text } = Typography;

interface TaskListTableProps {
  tasks: Task[];
  loading: boolean;
}

export function TaskListTable(props: TaskListTableProps) {
  const { tasks, loading } = props;

  const columns: ColumnsType<Task> = [
    {
      title: '任务 ID',
      dataIndex: '_id',
      key: '_id',
      width: 220,
      render: (value: string) => <Text className={styles.taskId}>{value}</Text>,
    },
    {
      title: '商品名称',
      dataIndex: ['brief', 'productName'],
      key: 'productName',
      width: 220,
      render: (value: string, task) => <Text strong>{value || task.name}</Text>,
    },
    {
      title: '商品图',
      dataIndex: ['brief', 'productImages'],
      key: 'productImages',
      width: 320,
      render: (_, task) => (
        <div className={styles.imageWrap}>
          <ImageList images={task.brief.productImages} />
        </div>
      ),
    },
    {
      title: '输入的 Prompt',
      dataIndex: ['brief', 'videoPrompt'],
      key: 'videoPrompt',
      width: 320,
      render: (value: string) => (
        <Text type="secondary" className={styles.promptPreview}>
          {value || '未填写'}
        </Text>
      ),
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (value, task) => (
        <StatusTag status={task.status} color={TASK_STATUS_TAG_COLOR_MAP[task.status]}>
          {getTaskStatusLabel(value)}
        </StatusTag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value: string) => <Text>{new Date(value).toLocaleString('zh-CN')}</Text>,
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, task) => {
        return (
          <Link to={`/tasks/${task._id}`}>
            <Button type="link" icon={<EyeOutlined />} className={styles.detailLinkButton}>
              查看详情
            </Button>
          </Link>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="_id"
      className={styles.table}
      columns={columns}
      dataSource={tasks}
      loading={loading}
      rowClassName={() => styles.taskTableRow}
      scroll={{ x: 1520 }}
      pagination={{ pageSize: 6, hideOnSinglePage: true }}
      locale={{
        emptyText: (
          <Space direction="vertical" size={8}>
            <Text type="secondary">暂时还没有任务，先创建一个新的带货短视频任务。</Text>
          </Space>
        ),
      }}
    />
  );
}
