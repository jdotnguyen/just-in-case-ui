import { forwardRef, useState } from 'react';
import type { ChangeEvent, ReactNode, TextareaHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { Field, useFieldIds } from '../Field/Field';
import styles from './Textarea.module.css';

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> {
  /** Visible label. Required: placeholders are not labels. */
  label: ReactNode;
  /** Extra guidance shown under the field. */
  helperText?: ReactNode;
  /** Error message. When set, the field is marked invalid. */
  error?: ReactNode;
  /** Class name for the outer wrapper (label + field + messages). */
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    helperText,
    error,
    id,
    required,
    disabled,
    rows = 3,
    maxLength,
    value,
    defaultValue,
    onChange,
    className,
    wrapperClassName,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const ids = useFieldIds({ id, helperText, error, describedBy: ariaDescribedBy });
  const counterId = `${ids.controlId}-counter`;

  // Track the length for the counter when uncontrolled.
  const [uncontrolledLength, setUncontrolledLength] = useState(
    () => String(defaultValue ?? '').length,
  );
  const length = value !== undefined ? String(value).length : uncontrolledLength;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setUncontrolledLength(event.target.value.length);
    onChange?.(event);
  }

  const describedBy =
    [ids.describedBy, maxLength !== undefined ? counterId : null].filter(Boolean).join(' ') ||
    undefined;

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
      <textarea
        ref={ref}
        id={ids.controlId}
        className={cx(styles.textarea, className)}
        rows={rows}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {maxLength !== undefined && (
        // Static text, not a live region: announcing every keystroke is noisy.
        <p className={styles.counter} id={counterId} data-near-limit={length >= maxLength * 0.9 || undefined}>
          {length} / {maxLength}
        </p>
      )}
    </Field>
  );
});
