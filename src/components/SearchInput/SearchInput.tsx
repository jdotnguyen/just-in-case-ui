import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { useControllableState } from '../../utils/useControllableState';
import { Field, useFieldIds } from '../Field/Field';
import inputStyles from '../TextInput/TextInput.module.css';
import styles from './SearchInput.module.css';

export interface SearchInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'children' | 'type' | 'value' | 'defaultValue' | 'onChange'
  > {
  /** Visible label, e.g. "Search products". Required. */
  label: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  /** Controlled text. Pair with onValueChange. */
  value?: string;
  /** Initial text when uncontrolled. */
  defaultValue?: string;
  /** Called with the new text on every change, including when cleared. */
  onValueChange?: (value: string) => void;
  /** Called with the text when the user presses Enter. */
  onSearch?: (value: string) => void;
  /** Class name for the outer wrapper (label + input + messages). */
  wrapperClassName?: string;
}

/**
 * A search field (role searchbox) with a Clear search button. Escape clears it
 * too, and Enter runs `onSearch`. The browser's own clear control is hidden.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    label,
    helperText,
    error,
    id,
    required,
    disabled,
    className,
    wrapperClassName,
    value: valueProp,
    defaultValue = '',
    onValueChange,
    onSearch,
    onKeyDown,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const ids = useFieldIds({ id, helperText, error, describedBy: ariaDescribedBy });
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });

  function clear() {
    setValue('');
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Enter') {
      onSearch?.(value);
    } else if (event.key === 'Escape' && value) {
      // Only swallow Escape when it does something, so dialogs can still close.
      event.preventDefault();
      event.stopPropagation();
      clear();
    }
  }

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
        <svg className={styles.icon} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          id={ids.controlId}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          className={cx(inputStyles.input, styles.input, className)}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          {...rest}
        />
        {value && !disabled && (
          <button type="button" className={styles.clear} aria-label="Clear search" onClick={clear}>
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path
                d="M5.5 5.5l9 9M14.5 5.5l-9 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </Field>
  );
});
