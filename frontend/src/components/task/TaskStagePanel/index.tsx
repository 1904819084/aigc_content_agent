import { Card, Collapse, Descriptions, Empty, Space, Tag, Typography } from 'antd';
import { TASK_STAGE_TAG_COLOR_MAP, TaskStageStatus } from '../../../constants/task';
import type { Task } from '../../../types';
import {
  formatTaskTimestamp,
  getTaskStageOutput,
  getTaskStageLabel,
  getTaskStageStatusLabel,
  hasTaskStageOutput,
} from '../../../utils/task';
import { StatusIcon } from '../../common/StatusIcon';
import { StatusTag } from '../../common/StatusTag';
import { StageFlowGraph } from '../StageFlowGraph';
import { StageOutputSection } from '../StageOutputSection';
import styles from './index.module.less';

const { Text } = Typography;

interface TaskStagePanelProps {
  task: Task | null;
}

export function TaskStagePanel(props: TaskStagePanelProps) {
  const { task } = props;
  const sectionCardClassNames = ['taskSectionCard', styles.sectionCard].join(' ');

  if (!task) {
    return (
      <Card variant="borderless" className={sectionCardClassNames}>
        <Empty description="没有找到对应任务" />
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={16} className={styles.root}>
      <Card variant="borderless" className={sectionCardClassNames}>
        <StageFlowGraph task={task} />
      </Card>

      <Card variant="borderless" title="阶段输出详情" className={sectionCardClassNames}>
        <Collapse
          accordion
          items={task.stages.map((stage) => ({
            key: stage.name,
            label: (
              <Space size={12}>
                <Text strong>{getTaskStageLabel(stage.name)}</Text>
                <StatusTag status={stage.status} color={TASK_STAGE_TAG_COLOR_MAP[stage.status]}>
                  {getTaskStageStatusLabel(stage.status)}
                </StatusTag>
              </Space>
            ),
            children: (
              <Space direction="vertical" size={16} className={styles.content}>
                <Descriptions
                  size="small"
                  column={1}
                  items={[
                    {
                      key: 'startedAt',
                      label: '开始时间',
                      children: formatTaskTimestamp(stage.startedAt),
                    },
                    {
                      key: 'finishedAt',
                      label: '完成时间',
                      children: formatTaskTimestamp(stage.finishedAt),
                    },
                    {
                      key: 'error',
                      label: '错误信息',
                      children: stage.error ? (
                        <Tag color="error" icon={<StatusIcon status={TaskStageStatus.Failed} />}>
                          {stage.error}
                        </Tag>
                      ) : (
                        <Tag color="success" icon={<StatusIcon status={TaskStageStatus.Completed} />}>
                          无错误
                        </Tag>
                      ),
                    },
                    {
                      key: 'status',
                      label: '执行状态',
                      children: (
                        <StatusTag status={stage.status} color={TASK_STAGE_TAG_COLOR_MAP[stage.status]}>
                          {getTaskStageStatusLabel(stage.status)}
                        </StatusTag>
                      ),
                    },
                  ]}
                />
                {hasTaskStageOutput(task, stage) ? (
                  <StageOutputSection output={getTaskStageOutput(task, stage)} />
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="该阶段还没有输出结果" />
                )}
              </Space>
            ),
          }))}
        />
      </Card>
    </Space>
  );
}
