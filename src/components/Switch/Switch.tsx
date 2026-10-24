import { forwardRef, useRef, useImperativeHandle } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { ErrorIcon, RequiredMark, useFieldIds } from '../Field/Field';
import fieldStyles from '../Field/Field.module.css';
import choiceStyles from '../Checkbox/Checkbox.module.css';
import styles from './Switch.module.css';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'role' | 'children'> {
  /** Visible label. Clicking it toggles the switch. */
  label: ReactNode;
  /** Extra detail under the label; read as the switch's description. */
  description?: ReactNode;
  /** Error message. When set, the switch is marked invalid. */
  error?: ReactNode;
  /** Class name for the outer wrapper. */
  wrapperClassName?: string;
}

/**
 * An on/off switch for settings that take effect immediately. It is a native
 * checkbox with role="switch", so Space, forms and `checked` all work natively.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    description,
    error,
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
  const ids = useFieldIds({ id, helperText: description, error, describedBy: ariaDescribedBy });
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  return (
    <div
      className={cx(choiceStyles.choice, wrapperClassName)}
      data-disabled={disabled || undefined}
    >
      <div className={choiceStyles.row}>
        <input
          ref={inputRef}
          type="checkbox"
          role="switch"
          id={ids.controlId}
          className={cx(styles.switch, className)}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          {...rest}
        />
        <div className={choiceStyles.text}>
          <label className={choiceStyles.label} htmlFor={ids.controlId}>
            {label}
            {required && <RequiredMark />}
          </label>
          {description && (
            // Clicking the description toggles too (mouse convenience; the
            // switch itself is the keyboard target).
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
            <p
              className={choiceStyles.description}
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
