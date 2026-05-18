import { Tag, type TagProps } from 'antd';
import type { ReactNode } from 'react';
import { StatusIcon } from '../StatusIcon';
import styles from './index.module.less';

interface StatusTagProps {
  status: Parameters<typeof StatusIcon>[0]['status'];
  color?: TagProps['color'];
  children: ReactNode;
  className?: string;
}

export function StatusTag(props: StatusTagProps) {
  const { status, color, children, className } = props;
  const mergedClassName = [styles.tag, className].filter(Boolean).join(' ');

  return (
    <Tag color={color} icon={<StatusIcon status={status} />} className={mergedClassName}>
      {children}
    </Tag>
  );
}
