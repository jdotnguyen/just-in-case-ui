import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';
import styles from './Alert.module.css';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  tone?: AlertTone;
  /** Short bold headline. */
  title?: ReactNode;
  /** The message. */
  children?: ReactNode;
  /** One optional action, such as "Try again". */
  action?: { label: string; onClick: () => void };
  /** Shows a Dismiss button that calls this. */
  onDismiss?: () => void;
  /**
   * Announce the message to screen readers. Use this only for alerts that
   * appear after the page has loaded; static alerts should stay quiet.
   */
  live?: boolean;
  id?: string;
  className?: string;
}

function ToneIcon({ tone }: { tone: AlertTone }) {
  return (
    <svg className={styles.icon} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      {tone === 'success' && (
        <>
          <circle cx="10" cy="10" r="8" fill="currentColor" />
          <path
            d="m6.5 10.2 2.4 2.4 4.6-5"
            fill="none"
            stroke="var(--jic-color-surface)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {tone === 'info' && (
        <>
          <circle cx="10" cy="10" r="8" fill="currentColor" />
          <path d="M10 9v4.5" stroke="var(--jic-color-surface)" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="10" cy="6.4" r="1" fill="var(--jic-color-surface)" />
        </>
      )}
      {tone === 'warning' && (
        <>
          <path
            d="M10 2.5 18 16.5H2z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M10 8v4" stroke="var(--jic-color-warning-soft)" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="10" cy="14.2" r="1" fill="var(--jic-color-warning-soft)" />
        </>
      )}
      {tone === 'danger' && (
        <>
          <path
            d="M7 2.5h6L17.5 7v6L13 17.5H7L2.5 13V7z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="m7.5 7.5 5 5m0-5-5 5"
            stroke="var(--jic-color-danger-soft)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

/**
 * A message that stays in the page. Meaning comes from the icon and text as
 * well as colour. It is silent unless `live` is set.
 */
export function Alert({
  tone = 'info',
  title,
  children,
  action,
  onDismiss,
  live = false,
  id,
  className,
}: AlertProps) {
  const role = live ? (tone === 'danger' || tone === 'warning' ? 'alert' : 'status') : undefined;
  return (
    <div id={id} role={role} className={cx(styles.alert, className)} data-tone={tone}>
      <ToneIcon tone={tone} />
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.message}>{children}</div>}
        {action && (
          <div className={styles.action}>
            <Button variant="secondary" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          </div>
        )}
      </div>
      {onDismiss && (
        <Button
          className={styles.dismiss}
          variant="tertiary"
          size="sm"
          aria-label="Dismiss"
          icon={
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path
                d="M5 5l10 10M15 5 5 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          }
          onClick={onDismiss}
        />
      )}
    </div>
  );
}
