import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import visually from '../../styles/visually-hidden.module.css';
import styles from './Pagination.module.css';

export interface PaginationProps {
  /** Current page, starting at 1. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /** Called with the page the user chose. Used when `getHref` isn't given. */
  onChange?: (page: number) => void;
  /** Makes each item a real link. Use for server-rendered or routed pages. */
  getHref?: (page: number) => string;
  /** How many pages to show either side of the current one. Defaults to 1. */
  siblingCount?: number;
  /** Accessible name for the navigation landmark. Defaults to "Pagination". */
  label?: string;
  className?: string;
}

type Entry = number | 'start-ellipsis' | 'end-ellipsis';

/** Builds the visible items: first, last, current and its siblings, with gaps as ellipses. */
export function buildPageEntries(page: number, pageCount: number, siblingCount: number): Entry[] {
  const total = siblingCount * 2 + 5; // siblings, current, first, last, two gaps
  if (pageCount <= total) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, pageCount);
  const showStartGap = left > 3;
  const showEndGap = right < pageCount - 2;
  const edge = siblingCount * 2 + 3;
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

  if (!showStartGap && showEndGap) return [...range(1, edge), 'end-ellipsis', pageCount];
  if (showStartGap && !showEndGap) return [1, 'start-ellipsis', ...range(pageCount - edge + 1, pageCount)];
  return [1, 'start-ellipsis', ...range(left, right), 'end-ellipsis', pageCount];
}

/** Previous, next and numbered pages. The current page is marked with aria-current. */
export function Pagination({
  page,
  pageCount,
  onChange,
  getHref,
  siblingCount = 1,
  label = 'Pagination',
  className,
}: PaginationProps) {
  const current = Math.min(Math.max(page, 1), Math.max(pageCount, 1));
  const entries = buildPageEntries(current, pageCount, siblingCount);

  // Announce the page after it changes, but stay quiet on first render.
  const [announcement, setAnnouncement] = useState('');
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setAnnouncement(`Page ${current} of ${pageCount}`);
  }, [current, pageCount]);

  function renderItem(
    target: number,
    content: ReactNode,
    props: { name: string; disabled?: boolean; isCurrent?: boolean },
  ) {
    const itemClass = styles.item;
    if (getHref && !props.disabled) {
      return (
        <a
          href={getHref(target)}
          className={itemClass}
          aria-label={props.name}
          aria-current={props.isCurrent ? 'page' : undefined}
        >
          {content}
        </a>
      );
    }
    return (
      <button
        type="button"
        className={itemClass}
        aria-label={props.name}
        aria-current={props.isCurrent ? 'page' : undefined}
        disabled={props.disabled}
        onClick={() => onChange?.(target)}
      >
        {content}
      </button>
    );
  }

  const chevron = (direction: 'left' | 'right') => (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" className={styles.chevron}>
      <path
        d={direction === 'left' ? 'm12 5-5 5 5 5' : 'm8 5 5 5-5 5'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <nav aria-label={label} className={cx(styles.nav, className)}>
      <ul className={styles.list}>
        <li>
          {renderItem(current - 1, chevron('left'), {
            name: 'Previous page',
            disabled: current <= 1,
          })}
        </li>
        {entries.map((entry) =>
          typeof entry === 'number' ? (
            <li key={entry}>
              {renderItem(entry, entry, {
                name: `Page ${entry}`,
                isCurrent: entry === current,
              })}
            </li>
          ) : (
            <li key={entry} aria-hidden="true" className={styles.ellipsis}>
              …
            </li>
          ),
        )}
        <li>
          {renderItem(current + 1, chevron('right'), {
            name: 'Next page',
            disabled: current >= pageCount,
          })}
        </li>
      </ul>
      <div role="status" className={visually.visuallyHidden}>
        {announcement}
      </div>
    </nav>
  );
}
