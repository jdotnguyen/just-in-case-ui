import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import type { MouseEvent, ReactNode, RefObject, SyntheticEvent } from 'react';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';
import styles from './Dialog.module.css';

export type DialogCloseReason = 'escape' | 'backdrop' | 'close-button';
export type DialogSize = 'sm' | 'md' | 'lg';

interface DialogBaseProps {
  /** Whether the dialog is open. The dialog never closes itself. */
  open: boolean;
  /** Called when the user asks to close; set `open` to false to close. */
  onClose: (reason: DialogCloseReason) => void;
  /** Visible title; names the dialog. */
  title: ReactNode;
  children?: ReactNode;
  /** Action buttons, in reading order (e.g. Cancel, then Confirm). */
  footer?: ReactNode;
  size?: DialogSize;
  /** Element to focus on open. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Element to focus on close. Defaults to whatever was focused on open. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  closeOnEscape?: boolean;
  /** Defaults to true for dialogs and false for alert dialogs. */
  closeOnBackdropClick?: boolean;
  hideCloseButton?: boolean;
  id?: string;
  className?: string;
}

interface StandardDialogProps extends DialogBaseProps {
  role?: 'dialog';
  /** Short text under the title; describes the dialog. */
  description?: ReactNode;
}

interface AlertDialogProps extends DialogBaseProps {
  /** For urgent confirmations, e.g. destructive actions. */
  role: 'alertdialog';
  /** Required for alert dialogs: what the user is being asked to confirm. */
  description: ReactNode;
}

export type DialogProps = StandardDialogProps | AlertDialogProps;

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

function isOutside(element: HTMLElement, event: { clientX: number; clientY: number }) {
  const rect = element.getBoundingClientRect();
  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  );
}

/**
 * Modal dialog built on the native <dialog> element (showModal), which makes
 * the rest of the page inert and puts the dialog in the top layer. Follows the
 * WAI-ARIA APG Dialog (Modal) and Alert Dialog patterns.
 */
export function Dialog(props: DialogProps) {
  const {
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    initialFocusRef,
    returnFocusRef,
    closeOnEscape = true,
    hideCloseButton = false,
    role = 'dialog',
    id,
    className,
  } = props;
  const closeOnBackdropClick = props.closeOnBackdropClick ?? role !== 'alertdialog';

  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const baseId = id ?? `jic-dialog-${generatedId}`;
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const mouseDownOnBackdrop = useRef(false);

  // Keep the latest props for the open/close effect without re-running it.
  const latest = useRef({ open, onClose, initialFocusRef, returnFocusRef, role });
  useLayoutEffect(() => {
    latest.current = { open, onClose, initialFocusRef, returnFocusRef, role };
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;

    if (!dialog.open) dialog.showModal();
    root.style.overflow = 'hidden';
    focusInitial();

    return () => {
      if (dialog.open) dialog.close();
      root.style.overflow = previousOverflow;
      const target = latest.current.returnFocusRef?.current ?? opener;
      if (target?.isConnected) target.focus();
      else document.body.focus();
    };

    function focusInitial() {
      const { initialFocusRef: initial, role: currentRole } = latest.current;
      if (initial?.current) {
        initial.current.focus();
        return;
      }
      if (currentRole === 'alertdialog') {
        // Default to the safe choice: the first footer button that isn't destructive.
        const safe = Array.from(
          footerRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [],
        ).find((button) => button.dataset.tone !== 'destructive');
        if (safe) {
          safe.focus();
          return;
        }
      }
      const first = bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      if (first) first.focus();
      else dialog!.focus();
    }
  }, [open]);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    // Escape: React owns `open`, so stop the native close and ask the parent.
    event.preventDefault();
    if (closeOnEscape) onClose('escape');
  }

  function handleNativeClose() {
    // Browsers may force-close on repeated Escape without user activation.
    // Keep the parent in sync if that happens while it still thinks we're open.
    if (latest.current.open) latest.current.onClose('escape');
  }

  function handleMouseDown(event: MouseEvent<HTMLDialogElement>) {
    mouseDownOnBackdrop.current =
      event.target === event.currentTarget && isOutside(event.currentTarget, event);
  }

  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    const startedOnBackdrop = mouseDownOnBackdrop.current;
    mouseDownOnBackdrop.current = false;
    if (
      closeOnBackdropClick &&
      startedOnBackdrop &&
      event.target === event.currentTarget &&
      isOutside(event.currentTarget, event)
    ) {
      onClose('backdrop');
    }
  }

  return (
    // The <dialog> handles Escape (cancel) natively; the click handler only
    // detects clicks on the backdrop.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      id={baseId}
      className={cx(styles.dialog, className)}
      data-size={size}
      role={role === 'alertdialog' ? 'alertdialog' : undefined}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      tabIndex={-1}
      onCancel={handleCancel}
      onClose={handleNativeClose}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {open && (
        <>
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {!hideCloseButton && (
              <Button
                variant="tertiary"
                size="sm"
                className={styles.close}
                aria-label="Close"
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
                onClick={() => onClose('close-button')}
              />
            )}
          </header>
          <div ref={bodyRef} className={styles.body}>
            {description && (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            )}
            {children}
          </div>
          {footer && (
            <div ref={footerRef} className={styles.footer}>
              {footer}
            </div>
          )}
        </>
      )}
    </dialog>
  );
}
