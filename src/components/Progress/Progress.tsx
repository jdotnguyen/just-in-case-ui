import { useId } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Progress.module.css';

export interface ProgressProps {
  /** Visible label that names the bar, e.g. "Uploading photos". Required. */
  label: ReactNode;
  /** Current amount. Leave out for an indeterminate bar (unknown duration). */
  value?: number;
  /** The amount that means "done". Defaults to 100. */
  max?: number;
  /** Shows the percentage next to the label. */
  showValue?: boolean;
  /** Spoken instead of the number, e.g. "3 of 12 files". */
  valueText?: string;
  className?: string;
  id?: string;
}

/**
 * A progress bar. With a `value` it is determinate; without one it is
 * indeterminate and animates (except for people who ask for reduced motion).
 */
export function Progress({
  label,
  value,
  max = 100,
  showValue = false,
  valueText,
  className,
  id,
}: ProgressProps) {
  const generated = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const labelId = `${id ?? `jic-progress-${generated}`}-label`;
  const determinate = value !== undefined;
  const safeMax = max > 0 ? max : 100;
  const clamped = determinate ? Math.min(Math.max(value, 0), safeMax) : undefined;
  const percent = clamped === undefined ? undefined : Math.round((clamped / safeMax) * 100);

  return (
    <div id={id} className={cx(styles.progress, className)}>
      <div className={styles.header}>
        <span id={labelId} className={styles.label}>
          {label}
        </span>
        {showValue && determinate && <span className={styles.value}>{percent}%</span>}
      </div>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        aria-valuetext={valueText}
        className={styles.track}
        data-indeterminate={!determinate || undefined}
      >
        <div
          className={styles.bar}
          style={determinate ? { inlineSize: `${percent}%` } : undefined}
        />
      </div>
    </div>
  );
}
