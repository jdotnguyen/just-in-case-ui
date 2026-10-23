import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonTone = 'default' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

interface ButtonBaseProps extends NativeButtonProps {
  /** primary = solid, secondary = outlined, tertiary = text only. */
  variant?: ButtonVariant;
  /** `destructive` turns any variant red. */
  tone?: ButtonTone;
  size?: ButtonSize;
  /**
   * Keep a disabled button in the tab order (uses aria-disabled) so keyboard
   * and screen reader users can still discover it.
   */
  focusableWhenDisabled?: boolean;
}

interface ButtonWithTextProps extends ButtonBaseProps {
  children: ReactNode;
  /** Decorative icon before the label. */
  startIcon?: ReactNode;
  /** Decorative icon after the label. */
  endIcon?: ReactNode;
  icon?: never;
}

interface IconOnlyButtonProps extends ButtonBaseProps {
  /** The only content of an icon-only button. */
  icon: ReactNode;
  /** Required: an icon-only button needs an accessible name. */
  'aria-label': string;
  children?: never;
  startIcon?: never;
  endIcon?: never;
}

export type ButtonProps = ButtonWithTextProps | IconOnlyButtonProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    tone = 'default',
    size = 'md',
    type = 'button',
    disabled = false,
    focusableWhenDisabled = false,
    className,
    onClick,
    children,
    startIcon,
    endIcon,
    icon,
    ...rest
  },
  ref,
) {
  const softDisabled = disabled && focusableWhenDisabled;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (softDisabled) {
      // Blocks activation, including form submission for type="submit".
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <button
      ref={ref}
      type={type}
      className={cx(styles.button, icon !== undefined && styles.iconOnly, className)}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      disabled={disabled && !focusableWhenDisabled}
      aria-disabled={softDisabled || undefined}
      onClick={handleClick}
      {...rest}
    >
      {icon !== undefined ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : (
        <>
          {startIcon && (
            <span className={styles.icon} aria-hidden="true">
              {startIcon}
            </span>
          )}
          <span className={styles.label}>{children}</span>
          {endIcon && (
            <span className={styles.icon} aria-hidden="true">
              {endIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
});
