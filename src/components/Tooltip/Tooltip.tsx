import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, PointerEvent, ReactElement, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx';
import { computePosition } from '../../utils/position';
import type { Placement as TooltipPlacement, Position } from '../../utils/position';
import styles from './Tooltip.module.css';

export type { TooltipPlacement };

export interface TooltipProps {
  /** Short supporting text. Keep it plain: no links, buttons or essential info. */
  content: ReactNode;
  /** One focusable element, such as a Button. It receives `aria-describedby`. */
  children: ReactElement<{ 'aria-describedby'?: string }>;
  /** Preferred side. It flips to the opposite side when there isn't room. */
  placement?: TooltipPlacement;
  /** Milliseconds to wait before showing on hover. Focus shows it immediately. */
  openDelay?: number;
  /** Milliseconds to wait before hiding, so the pointer can move onto the tooltip. */
  closeDelay?: number;
  id?: string;
  className?: string;
}

/**
 * A small label that describes its trigger, following the WAI-ARIA APG Tooltip
 * pattern and WCAG 1.4.13: it appears on hover and focus, can be hovered, and
 * Escape dismisses it. Supplementary only: touch users never see it.
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  openDelay = 400,
  closeDelay = 120,
  id,
  className,
}: TooltipProps) {
  const generated = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const tooltipId = id ?? `jic-tooltip-${generated}`;
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearTimer = useCallback(() => {
    if (timer.current !== undefined) clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const show = useCallback(
    (delay: number) => {
      clearTimer();
      if (delay <= 0) setOpen(true);
      else timer.current = setTimeout(() => setOpen(true), delay);
    },
    [clearTimer],
  );

  const hide = useCallback(
    (delay: number) => {
      clearTimer();
      if (delay <= 0) setOpen(false);
      else timer.current = setTimeout(() => setOpen(false), delay);
    },
    [clearTimer],
  );

  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;
    setPosition(
      computePosition(placement, trigger.getBoundingClientRect(), tip.getBoundingClientRect()),
    );
  }, [placement]);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, reposition, content]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      // Capture phase: dismiss the tooltip first, without also closing a
      // dialog or menu that the Escape key would otherwise reach.
      event.preventDefault();
      event.stopPropagation();
      clearTimer();
      setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, clearTimer]);

  function handlePointerEnter(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    show(openDelay);
  }

  function handlePointerLeave(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    hide(closeDelay);
  }

  const existing = children.props['aria-describedby'];
  const trigger = cloneElement(children, {
    'aria-describedby': existing ? `${existing} ${tooltipId}` : tooltipId,
  });

  const style: CSSProperties | undefined = position
    ? ({
        top: position.top,
        left: position.left,
        '--_arrow': `${position.arrow}px`,
      } as CSSProperties)
    : undefined;

  return (
    <>
      {/* The wrapper only listens for events that bubble up from the trigger. */}
      <span
        ref={triggerRef}
        className={styles.trigger}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={() => show(0)}
        onBlur={() => hide(0)}
      >
        {trigger}
      </span>
      {typeof document !== 'undefined' &&
        createPortal(
          // The tooltip itself is hoverable (WCAG 1.4.13), so it listens for the pointer.
          <div
            ref={tipRef}
            id={tooltipId}
            role="tooltip"
            className={cx(styles.tooltip, className)}
            data-placement={position?.placement ?? placement}
            hidden={!open}
            style={style}
            onPointerEnter={() => clearTimer()}
            onPointerLeave={(event) => {
              if (event.pointerType !== 'touch') hide(closeDelay);
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
