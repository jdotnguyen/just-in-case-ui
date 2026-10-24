import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button/Button';
import styles from './Toast.module.css';

export type ToastTone = 'info' | 'success' | 'danger';

export interface ToastOptions {
  /** Short headline. Keep it to a sentence at most. */
  title: ReactNode;
  description?: ReactNode;
  /** `danger` toasts are announced assertively. Defaults to `info`. */
  tone?: ToastTone;
  /**
   * Milliseconds before it dismisses itself, or `null` to stay until dismissed.
   * Defaults to 6000 for info and success; danger toasts and toasts with an
   * action stay until dismissed (WCAG 2.2.1: people need time to read and act).
   */
  duration?: number | null;
  /** One optional action, such as Undo. Running it also dismisses the toast. */
  action?: { label: string; onClick: () => void };
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

interface ToastEntry extends ToastOptions {
  id: string;
}

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 6000;

const ToastContext = createContext<ToastApi | null>(null);

/** Shows toasts from anywhere under a `ToastProvider`. */
export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.');
  }
  return context;
}

export interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Renders the toast area (two persistent live regions) and provides `useToast`.
 * Place it once, near the root of your app.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    counter.current += 1;
    const id = `jic-toast-${counter.current}`;
    setToasts((current) => [...current, { ...options, id }].slice(-MAX_TOASTS));
    return id;
  }, []);

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  const polite = toasts.filter((entry) => entry.tone !== 'danger');
  const assertive = toasts.filter((entry) => entry.tone === 'danger');

  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <section aria-label="Notifications" className={styles.viewport}>
            {/* Live regions must exist before content is added to them, so both
                are always rendered, even when empty. */}
            <div
              role="status"
              aria-atomic="false"
              aria-relevant="additions"
              className={styles.stack}
            >
              {polite.map((entry) => (
                <ToastItem key={entry.id} entry={entry} onDismiss={dismiss} />
              ))}
            </div>
            <div role="alert" aria-atomic="false" aria-relevant="additions" className={styles.stack}>
              {assertive.map((entry) => (
                <ToastItem key={entry.id} entry={entry} onDismiss={dismiss} />
              ))}
            </div>
          </section>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

function ToneIcon({ tone }: { tone: ToastTone }) {
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
      {tone === 'danger' && (
        <>
          <path
            d="M10 2.5 18 16.5H2z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M10 8v4"
            stroke="var(--jic-color-surface)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="10" cy="14.2" r="1" fill="var(--jic-color-surface)" />
        </>
      )}
      {tone === 'info' && (
        <>
          <circle cx="10" cy="10" r="8" fill="currentColor" />
          <path d="M10 9v4.5" stroke="var(--jic-color-surface)" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="10" cy="6.4" r="1" fill="var(--jic-color-surface)" />
        </>
      )}
    </svg>
  );
}

function ToastItem({
  entry,
  onDismiss,
}: {
  entry: ToastEntry;
  onDismiss: (id: string) => void;
}) {
  const { id, title, description, tone = 'info', action } = entry;
  const duration =
    entry.duration !== undefined
      ? entry.duration
      : tone === 'danger' || action
        ? null
        : DEFAULT_DURATION;
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  // Pausing (hover or focus) cancels the timer; resuming restarts the full time.
  useEffect(() => {
    if (duration === null || paused) return;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [duration, paused, id, onDismiss]);

  function close() {
    const root = ref.current;
    const target = returnFocusTo.current;
    const hadFocus = !!root && root.contains(document.activeElement);
    onDismiss(id);
    // Don't strand keyboard users on a removed element.
    if (hadFocus && target?.isConnected) target.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
    }
  }

  return (
    // The toast is not interactive itself; the handlers only pause the timer
    // and let Escape dismiss while focus is inside.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={ref}
      className={styles.toast}
      data-tone={tone}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={(event) => {
        setPaused(true);
        const from = event.relatedTarget;
        if (from instanceof HTMLElement && !ref.current?.contains(from)) {
          returnFocusTo.current = from;
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onKeyDown={handleKeyDown}
    >
      <ToneIcon tone={tone} />
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.actions}>
        {action && (
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => {
              action.onClick();
              close();
            }}
          >
            {action.label}
          </Button>
        )}
        <Button
          variant="tertiary"
          size="sm"
          aria-label="Dismiss notification"
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
          onClick={close}
        />
      </div>
    </div>
  );
}
