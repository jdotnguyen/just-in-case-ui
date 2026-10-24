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
import { computePosition } from '../../utils/position';
import type { Placement, Position } from '../../utils/position';
import styles from './Menu.module.css';

export type MenuPlacement = Placement;

export interface MenuItem {
  /** Unique id within the menu. */
  id: string;
  label: string;
  /** Called when the item is chosen. The menu closes afterwards. */
  onSelect?: () => void;
  /** Disabled items are skipped by the arrow keys and can't be chosen. */
  disabled?: boolean;
  /** Styles the item as dangerous, e.g. Delete. The label still says what it does. */
  destructive?: boolean;
  /** Decorative icon; hidden from assistive technology. */
  icon?: ReactNode;
  /** Draws a divider above this item. */
  separatorBefore?: boolean;
}

type TriggerProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  id?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-haspopup'?: 'menu';
};

export interface MenuProps {
  /** The button that opens the menu. It receives the aria attributes. */
  trigger: ReactElement<TriggerProps>;
  items: MenuItem[];
  /** Preferred side. It flips when there isn't room. Defaults to `bottom`. */
  placement?: MenuPlacement;
  id?: string;
  className?: string;
}

const TYPEAHEAD_RESET_MS = 500;

/**
 * An actions menu following the WAI-ARIA APG Menu Button pattern. Focus moves
 * onto the items (roving tabindex), and returns to the button afterwards.
 */
export function Menu({ trigger, items, placement = 'bottom', id, className }: MenuProps) {
  const generated = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const baseId = id ?? `jic-menu-${generated}`;
  const menuId = `${baseId}-menu`;
  const triggerId = trigger.props.id ?? `${baseId}-trigger`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<Position | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const typeahead = useRef({ buffer: '', timer: undefined as ReturnType<typeof setTimeout> | undefined });

  const enabled = items.map((item, index) => (item.disabled ? -1 : index)).filter((i) => i >= 0);

  function openAt(which: 'first' | 'last') {
    if (enabled.length === 0) return;
    setActiveIndex(which === 'first' ? enabled[0] : enabled[enabled.length - 1]);
    setOpen(true);
  }

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    setActiveIndex(-1);
    if (returnFocus) rootRef.current?.querySelector<HTMLElement>('[aria-haspopup]')?.focus();
  }, []);

  const reposition = useCallback(() => {
    const root = rootRef.current;
    const menu = menuRef.current;
    if (!root || !menu) return;
    setPosition(
      computePosition(placement, root.getBoundingClientRect(), menu.getBoundingClientRect(), 4, 'start'),
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

  // Keep DOM focus on the active item.
  useEffect(() => {
    if (open && activeIndex >= 0) itemRefs.current[activeIndex]?.focus({ preventScroll: true });
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    }
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open, close]);

  useEffect(() => {
    const state = typeahead.current;
    return () => clearTimeout(state.timer);
  }, []);

  function choose(index: number) {
    const item = items[index];
    if (!item || item.disabled) return;
    close(true);
    item.onSelect?.();
  }

  function matchTypeahead(char: string, from: number) {
    const state = typeahead.current;
    clearTimeout(state.timer);
    state.buffer += char.toLowerCase();
    state.timer = setTimeout(() => {
      state.buffer = '';
    }, TYPEAHEAD_RESET_MS);
    const repeated = state.buffer.length > 1 && [...state.buffer].every((c) => c === state.buffer[0]);
    const search = repeated ? state.buffer[0] : state.buffer;
    const begin = state.buffer.length === 1 || repeated ? from + 1 : from;
    for (let i = 0; i < items.length; i += 1) {
      const index = (begin + i + items.length) % items.length;
      if (!items[index].disabled && items[index].label.toLowerCase().startsWith(search)) return index;
    }
    return -1;
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLElement>) {
    trigger.props.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        event.preventDefault();
        openAt('first');
        break;
      case 'ArrowUp':
        event.preventDefault();
        openAt('last');
        break;
      default:
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = enabled.indexOf(activeIndex);
    const { key } = event;
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(enabled[(current + 1) % enabled.length]);
        return;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(enabled[(current - 1 + enabled.length) % enabled.length]);
        return;
      case 'Home':
        event.preventDefault();
        setActiveIndex(enabled[0]);
        return;
      case 'End':
        event.preventDefault();
        setActiveIndex(enabled[enabled.length - 1]);
        return;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      case 'Tab':
        // Close and let focus move on from the button.
        close(true);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        choose(activeIndex);
        return;
      default:
        if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          const match = matchTypeahead(key, activeIndex);
          if (match >= 0) setActiveIndex(match);
        }
    }
  }

  const style: CSSProperties | undefined = position
    ? { top: position.top, left: position.left }
    : undefined;

  const button = cloneElement(trigger, {
    id: triggerId,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': menuId,
    onKeyDown: handleTriggerKeyDown,
    onClick: (event: MouseEvent<HTMLElement>) => {
      trigger.props.onClick?.(event);
      if (event.defaultPrevented) return;
      if (open) close(false);
      else openAt('first');
    },
  });

  return (
    <span ref={rootRef} className={styles.root}>
      {button}
      {open && (
        // Keyboard handling is on the menu: DOM focus is on its items.
        // eslint-disable-next-line jsx-a11y/interactive-supports-focus
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          className={cx(styles.menu, className)}
          style={style}
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => (
            <div key={item.id} role="none" className={styles.entry}>
              {item.separatorBefore && index > 0 && (
                <div role="separator" className={styles.separator} />
              )}
              <button
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                role="menuitem"
                className={styles.item}
                tabIndex={index === activeIndex ? 0 : -1}
                aria-disabled={item.disabled || undefined}
                data-destructive={item.destructive || undefined}
                onClick={() => choose(index)}
                onMouseMove={() => {
                  if (!item.disabled && index !== activeIndex) setActiveIndex(index);
                }}
              >
                {item.icon && (
                  <span className={styles.icon} aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className={styles.label}>{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </span>
  );
}
