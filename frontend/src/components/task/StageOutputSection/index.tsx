import { Card, Descriptions, Space, Typography } from 'antd';
import type { TaskStageOutput } from '../../../types';
import { stringifyTaskOutput } from '../../../utils/task';
import styles from './index.module.less';

const { Paragraph, Text } = Typography;

const TASK_STAGE_OUTPUT_INPUT_LABELS: Record<string, string> = {
  productName: '商品名称',
  productImageCount: '商品图片数',
  hasVideoPrompt: '是否有 Prompt',
  scriptSectionCount: '剧本段落数',
  storyboardShotCount: '分镜数量',
  clipCount: '片段数量',
  totalDuration: '成片时长',
};

interface StageOutputSectionProps {
  output: TaskStageOutput | null;
}

function getStageInputItems(output: TaskStageOutput) {
  return Object.entries(output.input).map(([key, value]) => ({
    key,
    label: TASK_STAGE_OUTPUT_INPUT_LABELS[key] ?? key,
    children: String(value),
  }));
}

export function StageOutputSection(props: StageOutputSectionProps) {
  const { output } = props;

  if (!output) {
    return null;
  }

  return (
    <Space direction="vertical" size={16} className={styles.root}>
      <Card variant="borderless" className={styles.card} title="阶段摘要">
        <Space direction="vertical" size={12} className={styles.section}>
          {output.summary.map((item) => (
            <div key={`${item.label}-${item.value}`} className={styles.summaryItem}>
              <Text type="secondary">{item.label}</Text>
              <Text>{item.value}</Text>
            </div>
          ))}
        </Space>
      </Card>

      <Card variant="borderless" className={styles.card} title="阶段输入">
        <Descriptions size="small" column={1} items={getStageInputItems(output)} />
      </Card>

      <Card variant="borderless" className={styles.card} title="产出指标">
        <Descriptions
          size="small"
          column={1}
          items={output.metrics.map((item) => ({
            key: item.label,
            label: item.label,
            children: item.value,
          }))}
        />
      </Card>

      <Card variant="borderless" className={styles.card} title="原始结果">
        <Paragraph className={styles.jsonPanel}>
          <pre>{stringifyTaskOutput(output.result)}</pre>
        </Paragraph>
      </Card>
    </Space>
  );
}
