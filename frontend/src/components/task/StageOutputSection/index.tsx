import { Card, Empty, Space, Typography } from 'antd';
import type { TaskStageOutput } from '../../../types';
import { stringifyTaskOutput } from '../../../utils/task';
import styles from './index.module.less';

const { Paragraph } = Typography;

interface StageOutputSectionProps {
  output: TaskStageOutput | null;
}

export function StageOutputSection(props: StageOutputSectionProps) {
  const { output } = props;

  if (!output) {
    return null;
  }

  return (
    <Space direction="vertical" size={16} className={styles.root}>
      <Card variant="borderless" className={styles.card} title="阶段输入">
        {Object.keys(output.input).length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="该阶段没有输入快照" />
        ) : (
          <Paragraph className={styles.jsonPanel}>
            <pre>{stringifyTaskOutput(output.input)}</pre>
          </Paragraph>
        )}
      </Card>

      <Card variant="borderless" className={styles.card} title="阶段输出">
        <Paragraph className={styles.jsonPanel}>
          <pre>{stringifyTaskOutput(output.output)}</pre>
        </Paragraph>
      </Card>
    </Space>
  );
}
