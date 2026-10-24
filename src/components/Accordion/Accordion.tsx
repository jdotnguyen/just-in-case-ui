import { useId, useRef } from 'react';
import type { ElementType, KeyboardEvent, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { useControllableState } from '../../utils/useControllableState';
import styles from './Accordion.module.css';

export interface AccordionItem {
  /** Unique id; also used in `value` and `defaultValue`. */
  id: string;
  /** Visible heading text; names the panel. */
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** `single` keeps one item open at a time; `multiple` lets any be open. */
  type?: 'single' | 'multiple';
  /** In `single` mode, whether the open item can be closed. Defaults to true. */
  collapsible?: boolean;
  /** Heading level for item titles. Pick one that fits your page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Controlled: ids of the open items. Pair with onChange. */
  value?: string[];
  /** Uncontrolled: ids of the items open at first. */
  defaultValue?: string[];
  /** Called with the new list of open ids. */
  onChange?: (value: string[]) => void;
  id?: string;
  className?: string;
}

/** Past this many panels, regions would clutter the landmark list (APG advice). */
const MAX_REGIONS = 6;

/**
 * Expandable sections following the WAI-ARIA APG Accordion pattern: each title
 * is a heading containing a real button that controls its panel.
 */
export function Accordion({
  items,
  type = 'single',
  collapsible = true,
  headingLevel = 3,
  value,
  defaultValue = [],
  onChange,
  id,
  className,
}: AccordionProps) {
  const generated = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const baseId = id ?? `jic-accordion-${generated}`;
  const Heading = `h${headingLevel}` as ElementType;
  const [open, setOpen] = useControllableState<string[]>({ value, defaultValue, onChange });
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  function toggle(itemId: string) {
    const isOpen = open.includes(itemId);
    if (type === 'multiple') {
      setOpen(isOpen ? open.filter((openId) => openId !== itemId) : [...open, itemId]);
    } else if (isOpen) {
      if (collapsible) setOpen([]);
    } else {
      setOpen([itemId]);
    }
  }

  function focusButton(index: number) {
    buttons.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
    if (enabled.length === 0) return;
    const position = enabled.indexOf(index);
    let target: number | undefined;

    switch (event.key) {
      case 'ArrowDown':
        target = enabled[(position + 1) % enabled.length];
        break;
      case 'ArrowUp':
        target = enabled[(position - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        target = enabled[0];
        break;
      case 'End':
        target = enabled[enabled.length - 1];
        break;
      default:
        return;
    }
    event.preventDefault();
    focusButton(target);
  }

  return (
    <div id={baseId} className={cx(styles.accordion, className)}>
      {items.map((item, index) => {
        const isOpen = open.includes(item.id);
        const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '-');
        const buttonId = `${baseId}-${safeId}-button`;
        const panelId = `${baseId}-${safeId}-panel`;
        return (
          <div key={item.id} className={styles.item} data-open={isOpen || undefined}>
            <Heading className={styles.heading}>
              <button
                ref={(element) => {
                  buttons.current[index] = element;
                }}
                type="button"
                id={buttonId}
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggle(item.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span className={styles.title}>{item.title}</span>
                <svg
                  className={styles.chevron}
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5 7.5 5 5 5-5"
                  />
                </svg>
              </button>
            </Heading>
            <div
              id={panelId}
              role={items.length <= MAX_REGIONS ? 'region' : undefined}
              aria-labelledby={items.length <= MAX_REGIONS ? buttonId : undefined}
              className={styles.panel}
              hidden={!isOpen}
            >
              <div className={styles.panelInner}>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
