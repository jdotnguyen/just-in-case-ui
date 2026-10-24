import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Field, useFieldIds } from '../Field/Field';
import inputStyles from '../TextInput/TextInput.module.css';
import styles from './PasswordInput.module.css';

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'children' | 'type'> {
  /** Visible label. Required: placeholders are not labels. */
  label: ReactNode;
  helperText?: ReactNode;
  /** Error message. When set, the input is marked invalid. */
  error?: ReactNode;
  /** Class name for the outer wrapper (label + input + messages). */
  wrapperClassName?: string;
}

/**
 * A password field with a Show password toggle. The toggle keeps one name and
 * reports its state with aria-pressed; focus and the typed value never move.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  {
    label,
    helperText,
    error,
    id,
    required,
    disabled,
    className,
    wrapperClassName,
    autoComplete = 'current-password',
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const ids = useFieldIds({ id, helperText, error, describedBy: ariaDescribedBy });
  const [visible, setVisible] = useState(false);

  return (
    <Field
      ids={ids}
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      disabled={disabled}
      className={wrapperClassName}
    >
      <div className={styles.control}>
        <input
          ref={ref}
          id={ids.controlId}
          type={visible ? 'text' : 'password'}
          className={cx(inputStyles.input, styles.input, className)}
          autoComplete={autoComplete}
          autoCapitalize="off"
          spellCheck={false}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          {...rest}
        />
        <button
          type="button"
          className={styles.toggle}
          aria-label="Show password"
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path
              d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.7" />
            {/* The slash is drawn only while the password is visible, so the icon shows state too. */}
            {visible && (
              <path d="M3.5 16.5 16.5 3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
    </Field>
  );
});
