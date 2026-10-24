import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: ReactNode;
  /** Where the item links to. The last item is the current page and is never a link. */
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Accessible name for the navigation landmark. Defaults to "Breadcrumb". */
  label?: string;
  className?: string;
}

/** Shows where the current page sits in a hierarchy. The last item is the current page. */
export function Breadcrumbs({ items, label = 'Breadcrumb', className }: BreadcrumbsProps) {
  return (
    <nav aria-label={label} className={cx(styles.nav, className)}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={index} className={styles.item}>
              {current || !item.href ? (
                <span className={styles.current} aria-current={current ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <a className={styles.link} href={item.href}>
                  {item.label}
                </a>
              )}
              {!current && (
                <svg className={styles.separator} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                  <path
                    d="m8 5 5 5-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
