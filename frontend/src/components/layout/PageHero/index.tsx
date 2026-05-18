import type { ReactNode } from 'react';
import styles from './index.module.less';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  extra?: ReactNode;
  compact?: boolean;
}

export function PageHero(props: PageHeroProps) {
  const { eyebrow, title, description, actions, extra, compact } = props;
  const heroClassNames = [styles.hero, compact ? styles.compact : ''].filter(Boolean).join(' ');

  return (
    <header className={heroClassNames}>
      <div className={styles.content}>
        <div className={styles.main}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
          {actions}
        </div>
        {extra ? <div className={styles.extra}>{extra}</div> : null}
      </div>
    </header>
  );
}
