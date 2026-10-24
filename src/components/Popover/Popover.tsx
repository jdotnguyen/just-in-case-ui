import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactElement, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { FOCUSABLE_SELECTOR } from '../../utils/focusable';
import { computePosition } from '../../utils/position';
import type { Placement, Position } from '../../utils/position';
import { useControllableState } from '../../utils/useControllableState';
import styles from './Popover.module.css';

export type PopoverPlacement = Placement;

type TriggerProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-haspopup'?: 'dialog';
};

export interface PopoverProps {
  /** The button that opens the popover. It receives the aria attributes. */
  trigger: ReactElement<TriggerProps>;
  /** Accessible name for the panel, e.g. "Filters". */
  label: string;
  children: ReactNode;
  /** Preferred side. It flips when there isn't room. Defaults to `bottom`. */
  placement?: PopoverPlacement;
  /** Controlled open state. Pair with onOpenChange. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  className?: string;
}

/**
 * A non-modal floating panel opened by a button. The panel follows the trigger
 * in the DOM so Tab order is natural. Escape closes it and returns focus to
 * the trigger; clicking away or tabbing away closes it too.
 */
export function Popover({
  trigger,
  label,
  children,
  placement = 'bottom',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  id,
  className,
}: PopoverProps) {
  const generated = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const panelId = id ?? `jic-popover-${generated}`;
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [position, setPosition] = useState<Position | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const reposition = useCallback(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;
    setPosition(
      computePosition(placement, root.getBoundingClientRect(), panel.getBoundingClientRect(), 6, 'start'),
    );
  }, [placement]);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, reposition]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const first = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (first ?? panel).focus({ preventScroll: true });
  }, [open]);

  // A press outside closes it, without taking focus from where the user clicked.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open, setOpen]);

  function focusTrigger() {
    const button = rootRef.current?.querySelector<HTMLElement>('[aria-controls]');
    button?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      focusTrigger();
    }
  }

  const style: CSSProperties | undefined = position
    ? { top: position.top, left: position.left }
    : undefined;

  const button = cloneElement(trigger, {
    'aria-expanded': open,
    'aria-controls': panelId,
    'aria-haspopup': 'dialog',
    onClick: (event: MouseEvent<HTMLElement>) => {
      trigger.props.onClick?.(event);
      if (!event.defaultPrevented) setOpen(!open);
    },
  });

  return (
    // The wrapper only watches for Escape and focus leaving; the trigger and
    // panel are the interactive elements.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <span
      ref={rootRef}
      className={styles.root}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (open && next instanceof Node && !event.currentTarget.contains(next)) setOpen(false);
      }}
    >
      {button}
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={label}
          tabIndex={-1}
          className={cx(styles.panel, className)}
          style={style}
        >
          {children}
        </div>
      )}
    </span>
  );
}
