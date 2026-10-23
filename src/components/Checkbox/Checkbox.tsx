import { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { ErrorIcon, FieldsetField, RequiredMark, useFieldIds } from '../Field/Field';
import fieldStyles from '../Field/Field.module.css';
import styles from './Checkbox.module.css';

/** Lets a CheckboxGroup mark its checkboxes invalid. */
const CheckboxGroupContext = createContext<{ invalid: boolean }>({ invalid: false });

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'children'> {
  /** Visible label. Clicking it toggles the checkbox. */
  label: ReactNode;
  /** Extra detail under the label; read as the checkbox's description. */
  description?: ReactNode;
  /** Error message. When set, the checkbox is marked invalid. */
  error?: ReactNode;
  /** Shows a dash and exposes the "mixed" state, e.g. for "select all". */
  indeterminate?: boolean;
  /** Class name for the outer wrapper. */
  wrapperClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    description,
    error,
    indeterminate = false,
    id,
    required,
    disabled,
    className,
    wrapperClassName,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const group = useContext(CheckboxGroupContext);
  const ids = useFieldIds({ id, helperText: description, error, describedBy: ariaDescribedBy });
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  // `indeterminate` is a DOM property with no HTML attribute.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const invalid = Boolean(error) || group.invalid;

  return (
    <div className={cx(styles.choice, wrapperClassName)} data-disabled={disabled || undefined}>
      <div className={styles.row}>
        <input
          ref={inputRef}
          type="checkbox"
          id={ids.controlId}
          className={cx(styles.checkbox, className)}
          required={required}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={ids.describedBy}
          {...rest}
        />
        <div className={styles.text}>
          <label className={styles.label} htmlFor={ids.controlId}>
            {label}
            {required && <RequiredMark />}
          </label>
          {description && (
            // Clicking the description toggles too (mouse convenience; the
            // checkbox itself is the keyboard target).
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
            <p
              className={styles.description}
              id={ids.helperId}
              onClick={() => !disabled && inputRef.current?.click()}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p className={cx(fieldStyles.error, styles.error)} id={ids.errorId}>
          <ErrorIcon />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});

export interface CheckboxGroupProps {
  /** Visible legend that names the group. */
  legend: ReactNode;
  helperText?: ReactNode;
  /** Group error. Marks every checkbox in the group invalid. */
  error?: ReactNode;
  /**
   * Shows a required mark. Browsers can't validate "pick at least one", so
   * validate yourself and pass `error`.
   */
  required?: boolean;
  /** Disables every checkbox in the group. */
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  id?: string;
  className?: string;
  children: ReactNode;
}

export function CheckboxGroup({
  legend,
  helperText,
  error,
  required,
  disabled,
  orientation = 'vertical',
  id,
  className,
  children,
}: CheckboxGroupProps) {
  const ids = useFieldIds({ id, helperText, error });
  return (
    <FieldsetField
      ids={ids}
      legend={legend}
      helperText={helperText}
      error={error}
      required={required}
      disabled={disabled}
      orientation={orientation}
      className={className}
    >
      <CheckboxGroupContext.Provider value={{ invalid: Boolean(error) }}>
        {children}
      </CheckboxGroupContext.Provider>
    </FieldsetField>
  );
}
