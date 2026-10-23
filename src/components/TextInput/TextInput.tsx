import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Field, useFieldIds } from '../Field/Field';
import styles from './TextInput.module.css';

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'children'> {
  /** Visible label. Required: placeholders are not labels. */
  label: ReactNode;
  /** Extra guidance shown under the input. */
  helperText?: ReactNode;
  /** Error message. When set, the input is marked invalid. */
  error?: ReactNode;
  /** Class name for the outer wrapper (label + input + messages). */
  wrapperClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    label,
    helperText,
    error,
    id,
    required,
    disabled,
    className,
    wrapperClassName,
    type = 'text',
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const ids = useFieldIds({ id, helperText, error, describedBy: ariaDescribedBy });

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
      <input
        ref={ref}
        id={ids.controlId}
        type={type}
        className={cx(styles.input, className)}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        {...rest}
      />
    </Field>
  );
});
