import { RobotFilled } from '@ant-design/icons';
import { Card } from 'antd';
import { TASK_STAGE_LABELS } from '../../../constants/task';
import type { SubAgentMeta } from '../../../types';
import styles from './index.module.less';

interface SubAgentCardProps {
  subAgent: SubAgentMeta;
  index: number;
  onClick: (subAgent: SubAgentMeta) => void;
}

const ICON_TONES = [styles.iconRed, styles.iconYellow, styles.iconBlue];

export function SubAgentCard(props: SubAgentCardProps) {
  const { subAgent, index, onClick } = props;
  const toneClass = ICON_TONES[index % ICON_TONES.length];

  return (
    <Card
      variant="borderless"
      className={styles.card}
      styles={{ body: { padding: 20 } }}
      onClick={() => onClick(subAgent)}
    >
      <div className={styles.header}>
        <span className={`${styles.iconWrap} ${toneClass}`}>
          <RobotFilled />
        </span>
        <div>
          <h3 className={styles.title}>{subAgent.displayName}</h3>
          <p className={styles.stage}>
            对应阶段：{subAgent.stageNames.map((s) => TASK_STAGE_LABELS[s]).join(' / ')}
          </p>
        </div>
      </div>
      <p className={styles.description}>{subAgent.description}</p>
      <code className={styles.promptKey}>{subAgent.promptKey}</code>
    </Card>
  );
}
