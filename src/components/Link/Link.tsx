import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import visually from '../../styles/visually-hidden.module.css';
import styles from './Link.module.css';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  /** Opens in a new tab. Adds an icon and tells screen reader users. */
  external?: boolean;
}

/** A link that is always underlined, so it never relies on colour alone. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { external = false, className, children, target, rel, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      {...rest}
      className={cx(styles.link, className)}
      target={external ? '_blank' : target}
      rel={external ? 'noopener noreferrer' : rel}
    >
      {children}
      {external && (
        <>
          <svg className={styles.external} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path
              d="M8 5H5v10h10v-3M11 4h5v5M16 4l-7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={visually.visuallyHidden}> (opens in a new tab)</span>
        </>
      )}
    </a>
  );
});
