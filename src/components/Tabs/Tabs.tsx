import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { FOCUSABLE_SELECTOR } from '../../utils/focusable';
import { useControllableState } from '../../utils/useControllableState';
import styles from './Tabs.module.css';

export interface TabItem {
  /** Unique id; also used in `value` and `defaultValue`. */
  id: string;
  /** Visible tab text. */
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** Accessible name for the group of tabs, e.g. "Account settings". */
  label: string;
  tabs: TabItem[];
  /** Controlled: id of the selected tab. Pair with onChange. */
  value?: string;
  /** Uncontrolled: id of the tab selected at first. Defaults to the first enabled tab. */
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** `automatic` selects on focus; `manual` waits for Enter or Space. */
  activation?: 'automatic' | 'manual';
  orientation?: 'horizontal' | 'vertical';
  id?: string;
  className?: string;
}

/**
 * Tabs following the WAI-ARIA APG Tabs pattern: roving tabindex, arrow-key
 * navigation, and panels that stay in the DOM so aria-controls always resolves.
 */
export function Tabs({
  label,
  tabs,
  value,
  defaultValue,
  onChange,
  activation = 'automatic',
  orientation = 'horizontal',
  id,
  className,
}: TabsProps) {
  const generated = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const baseId = id ?? `jic-tabs-${generated}`;
  const firstEnabled = tabs.find((tab) => !tab.disabled)?.id ?? tabs[0]?.id ?? '';
  const [selected, setSelected] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? firstEnabled,
    onChange,
  });
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  // Panels without focusable content get tabIndex=0 so keyboard users can reach them.
  const [panelNeedsStop, setPanelNeedsStop] = useState<Record<string, boolean>>({});

  const selectedIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === selected),
  );
  const selectedTab = tabs[selectedIndex];

  // Runs after every render on purpose: panel content can change what is focusable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const next: Record<string, boolean> = {};
    tabs.forEach((tab, index) => {
      const panel = panelRefs.current[index];
      next[tab.id] = !!panel && !panel.querySelector(FOCUSABLE_SELECTOR);
    });
    setPanelNeedsStop((previous) => {
      const same =
        Object.keys(next).length === Object.keys(previous).length &&
        Object.keys(next).every((key) => previous[key] === next[key]);
      return same ? previous : next;
    });
  });

  const vertical = orientation === 'vertical';
  const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
  const previousKey = vertical ? 'ArrowUp' : 'ArrowLeft';

  function move(index: number) {
    tabRefs.current[index]?.focus();
    if (activation === 'automatic') select(tabs[index].id);
  }

  function select(tabId: string) {
    if (tabId !== selectedTab?.id) setSelected(tabId);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const enabled = tabs.map((tab, i) => (tab.disabled ? -1 : i)).filter((i) => i >= 0);
    if (enabled.length === 0) return;
    const position = enabled.indexOf(index);
    let target: number | undefined;
    switch (event.key) {
      case nextKey:
        target = enabled[(position + 1) % enabled.length];
        break;
      case previousKey:
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
    move(target);
  }

  return (
    <div id={baseId} className={cx(styles.tabs, className)} data-orientation={orientation}>
      <div
        role="tablist"
        aria-label={label}
        aria-orientation={vertical ? 'vertical' : undefined}
        className={styles.list}
      >
        {tabs.map((tab, index) => {
          const isSelected = index === selectedIndex;
          const safeId = tab.id.replace(/[^a-zA-Z0-9_-]/g, '-');
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${baseId}-${safeId}-tab`}
              className={styles.tab}
              aria-selected={isSelected}
              aria-controls={`${baseId}-${safeId}-panel`}
              tabIndex={isSelected ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => select(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab, index) => {
        const isSelected = index === selectedIndex;
        const safeId = tab.id.replace(/[^a-zA-Z0-9_-]/g, '-');
        return (
          <div
            key={tab.id}
            ref={(element) => {
              panelRefs.current[index] = element;
            }}
            role="tabpanel"
            id={`${baseId}-${safeId}-panel`}
            aria-labelledby={`${baseId}-${safeId}-tab`}
            className={styles.panel}
            hidden={!isSelected}
            tabIndex={isSelected && panelNeedsStop[tab.id] ? 0 : undefined}
          >
            {tab.content}
          </div>
        );
      })}
    </div>
  );
}
