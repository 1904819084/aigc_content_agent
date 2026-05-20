import { CheckCircleFilled, ClockCircleOutlined, CloseCircleFilled, LoadingOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';
import { TaskStageStatus, type TaskStatus } from '../../../constants/task';
import styles from './index.module.less';

type UnifiedStatus = TaskStageStatus | TaskStatus;

interface StatusIconProps {
  status: UnifiedStatus;
  size?: number;
  className?: string;
}

export function StatusIcon(props: StatusIconProps) {
  const { status, size, className } = props;
  const iconStyle: CSSProperties | undefined = size ? { fontSize: size } : undefined;
  const mergedClassName = [styles.icon, className].filter(Boolean).join(' ');

  if (status === TaskStageStatus.Completed) {
    return <CheckCircleFilled className={[mergedClassName, styles.success].join(' ')} style={iconStyle} />;
  }

  if (status === TaskStageStatus.Failed) {
    return <CloseCircleFilled className={[mergedClassName, styles.failure].join(' ')} style={iconStyle} />;
  }

  if (status === TaskStageStatus.Pending) {
    return <ClockCircleOutlined className={[mergedClassName, styles.pending].join(' ')} style={iconStyle} />;
  }

  return (
    <LoadingOutlined
      spin
      className={[mergedClassName, styles.running].join(' ')}
      style={iconStyle}
    />
  );
}
