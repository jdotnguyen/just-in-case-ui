import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { FieldsetField, useFieldIds } from '../Field/Field';
import choiceStyles from '../Checkbox/Checkbox.module.css';

export interface RadioOption {
  value: string;
  label: ReactNode;
  /** Extra detail under the label; read as the radio's description. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Visible legend that names the group. */
  legend: ReactNode;
  options: RadioOption[];
  /** Controlled value. Pair with onChange. */
  value?: string | null;
  /** Initial value when uncontrolled. */
  defaultValue?: string | null;
  /** Called with the newly selected option's value. */
  onChange?: (value: string) => void;
  /** Shared input name. Generated if omitted. */
  name?: string;
  helperText?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Disables every option. */
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  id?: string;
  className?: string;
}

/**
 * Native radio buttons in a <fieldset role="radiogroup">. The browser
 * provides the single Tab stop and arrow-key selection.
 */
export function RadioGroup({
  legend,
  options,
  value,
  defaultValue = null,
  onChange,
  name,
  helperText,
  error,
  required,
  disabled,
  orientation = 'vertical',
  id,
  className,
}: RadioGroupProps) {
  const ids = useFieldIds({ id, helperText, error });
  const groupName = name ?? `${ids.controlId}-name`;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | null>(defaultValue);
  const selected = isControlled ? value : internalValue;
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function select(next: string) {
    if (!isControlled) setInternalValue(next);
    if (next !== selected) onChange?.(next);
  }

  return (
    <FieldsetField
      ids={ids}
      legend={legend}
      helperText={helperText}
      error={error}
      required={required}
      disabled={disabled}
      orientation={orientation}
      role="radiogroup"
      className={className}
    >
      {options.map((option, index) => {
        const optionId = `${ids.controlId}-option-${index}`;
        const descriptionId = option.description ? `${optionId}-description` : undefined;
        const optionDisabled = disabled || option.disabled;
        return (
          <div
            key={option.value}
            className={choiceStyles.choice}
            data-disabled={optionDisabled || undefined}
          >
            <div className={choiceStyles.row}>
              <input
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="radio"
                id={optionId}
                name={groupName}
                value={option.value}
                className={choiceStyles.radio}
                checked={selected === option.value}
                onChange={() => select(option.value)}
                disabled={option.disabled}
                required={required}
                aria-describedby={descriptionId}
              />
              <div className={choiceStyles.text}>
                <label className={choiceStyles.label} htmlFor={optionId}>
                  {option.label}
                </label>
                {option.description && (
                  // Mouse convenience; the radio itself is the keyboard target.
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                  <p
                    id={descriptionId}
                    className={cx(choiceStyles.description)}
                    onClick={() => !optionDisabled && inputRefs.current[index]?.click()}
                  >
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </FieldsetField>
  );
}
