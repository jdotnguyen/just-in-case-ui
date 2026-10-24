import { cx } from '../../utils/cx';
import visually from '../../styles/visually-hidden.module.css';
import styles from './Spinner.module.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  /** What is loading, read aloud. Defaults to "Loading". */
  label?: string;
  size?: SpinnerSize;
  /** Show the label as text next to the spinner. */
  showLabel?: boolean;
  className?: string;
}

/**
 * A loading indicator. It is a status region whose only content is the label.
 * For long waits, prefer a Progress bar or a message that says what is happening.
 */
export function Spinner({ label = 'Loading', size = 'md', showLabel = false, className }: SpinnerProps) {
  return (
    <span role="status" className={cx(styles.spinner, className)} data-size={size}>
      <svg className={styles.graphic} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle className={styles.track} cx="12" cy="12" r="9" fill="none" strokeWidth="3" />
        <path
          className={styles.arc}
          d="M12 3a9 9 0 0 1 9 9"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className={showLabel ? styles.text : visually.visuallyHidden}>{label}</span>
    </span>
  );
}
