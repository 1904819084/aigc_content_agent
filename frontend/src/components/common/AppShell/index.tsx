import type { ReactNode } from 'react';
import styles from './index.module.less';

interface AppShellProps {
  header: ReactNode;
  children: ReactNode;
  mainClassName?: string;
}

export function AppShell(props: AppShellProps) {
  const { header, children, mainClassName } = props;
  const mainClassNames = [styles.main, mainClassName].filter(Boolean).join(' ');

  return (
    <div className={styles.page}>
      {header}
      <main className={mainClassNames}>{children}</main>
    </div>
  );
}
