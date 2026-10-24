import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Decorative icon before the text; hidden from assistive technology. */
  icon?: ReactNode;
  /** The text. A badge always has words, so colour is never the only clue. */
  children: ReactNode;
}

/** A short status label such as "Paid", "Draft" or "Failed". */
export function Badge({ tone = 'neutral', icon, children, className, ...rest }: BadgeProps) {
  return (
    <span {...rest} className={cx(styles.badge, className)} data-tone={tone}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
