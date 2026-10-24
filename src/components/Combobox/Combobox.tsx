import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx';
import dropdownStyles from '../Dropdown/Dropdown.module.css';
import { Field, useFieldIds } from '../Field/Field';
import inputStyles from '../TextInput/TextInput.module.css';
import styles from './Combobox.module.css';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  /** Visible label. Required. */
  label: ReactNode;
  options: ComboboxOption[];
  /** Controlled value (an option's `value`, or null for none). Pair with onChange. */
  value?: string | null;
  /** Initial value when uncontrolled. */
  defaultValue?: string | null;
  /** Called when the chosen option changes, or with null when cleared. */
  onChange?: (value: string | null) => void;
  /** Decides which options match the typed text. Defaults to a case-insensitive "contains". */
  filter?: (option: ComboboxOption, query: string) => boolean;
  placeholder?: string;
  /** Shown when nothing matches. */
  emptyMessage?: string;
  helperText?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Form field name. When set, the chosen value is submitted with native forms. */
  name?: string;
  id?: string;
  className?: string;
  onBlur?: () => void;
}

const POPUP_GAP = 4;
const POPUP_MAX_HEIGHT = 280;

type Position = Pick<CSSProperties, 'top' | 'bottom' | 'left' | 'minWidth' | 'maxHeight'>;

const defaultFilter = (option: ComboboxOption, query: string) =>
  option.label.toLowerCase().includes(query.trim().toLowerCase());

/**
 * An editable combobox that filters a list as you type, following the WAI-ARIA
 * APG "Combobox with List Autocomplete" pattern. DOM focus stays in the input;
 * the active option is conveyed with aria-activedescendant. The value is always
 * one of the options (or none): text that doesn't match is reverted on blur.
 */
export function Combobox({
  label,
  options,
  value,
  defaultValue = null,
  onChange,
  filter = defaultFilter,
  placeholder,
  emptyMessage = 'No matches',
  helperText,
  error,
  required,
  disabled,
  name,
  id,
  className,
  onBlur,
}: ComboboxProps) {
  const ids = useFieldIds({ id, helperText, error });
  const listboxId = `${ids.controlId}-listbox`;
  const optionId = (index: number) => `${ids.controlId}-option-${index}`;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | null>(defaultValue);
  const selectedValue = isControlled ? value : internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const selectedLabel = selectedOption?.label ?? '';

  const [inputText, setInputText] = useState(selectedLabel);
  // The text the user typed since the list last opened; empty shows everything.
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<Position>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    // Inside a modal dialog the list must live in the dialog, or it would be inert.
    setPortalTarget(controlRef.current?.closest('dialog') ?? document.body);
  }, []);

  const filtered = query ? options.filter((option) => filter(option, query)) : options;
  const hasResults = filtered.length > 0;
  const expanded = open && hasResults;
  const selectedIndexInList = filtered.findIndex((option) => option.value === selectedValue);

  // Keep the text in step with the value when it changes from outside.
  useEffect(() => {
    setInputText(selectedLabel);
    setQuery('');
  }, [selectedLabel]);

  const enabledIndexes = filtered.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);

  function commit(next: string | null) {
    if (next === selectedValue) return;
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }

  function closeList() {
    setOpen(false);
    setActiveIndex(-1);
    setQuery('');
  }

  function selectFiltered(index: number) {
    const option = filtered[index];
    if (!option || option.disabled) return;
    setInputText(option.label);
    commit(option.value);
    closeList();
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    setInputText(text);
    setQuery(text);
    setOpen(true);
    setActiveIndex(-1);
    // Emptying the box clears the value, so text and value never disagree.
    if (text === '') commit(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    const { key, altKey } = event;
    switch (key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (!expanded) {
          setOpen(true);
          if (altKey) return;
          const start = selectedIndexInList >= 0 ? selectedIndexInList : enabledIndexes[0];
          setActiveIndex(start ?? -1);
          return;
        }
        const next = enabledIndexes.find((i) => i > activeIndex);
        setActiveIndex(next ?? activeIndex);
        return;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (!expanded) {
          setOpen(true);
          setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? -1);
          return;
        }
        const previous = [...enabledIndexes].reverse().find((i) => i < activeIndex);
        setActiveIndex(
          activeIndex < 0
            ? (enabledIndexes[enabledIndexes.length - 1] ?? -1)
            : (previous ?? activeIndex),
        );
        return;
      }
      case 'Enter':
        if (expanded && activeIndex >= 0) {
          event.preventDefault();
          selectFiltered(activeIndex);
        }
        return;
      case 'Escape':
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          setInputText(selectedLabel);
          closeList();
        } else if (inputText) {
          event.preventDefault();
          event.stopPropagation();
          setInputText('');
          commit(null);
        }
        return;
      default:
    }
  }

  function handleBlur() {
    // Typed text that exactly matches an option counts as choosing it; anything
    // else snaps back to the current value.
    const exact = options.find(
      (option) => !option.disabled && option.label.toLowerCase() === inputText.trim().toLowerCase(),
    );
    if (exact && inputText) {
      setInputText(exact.label);
      commit(exact.value);
    } else {
      setInputText(selectedLabel);
    }
    closeList();
    onBlur?.();
  }

  // ---- positioning & scrolling ---------------------------------------------

  const updatePosition = useCallback(() => {
    const control = controlRef.current;
    const listbox = listboxRef.current;
    if (!control || !listbox) return;
    const rect = control.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom - POPUP_GAP * 2;
    const spaceAbove = rect.top - POPUP_GAP * 2;
    const wanted = Math.min(listbox.scrollHeight, POPUP_MAX_HEIGHT);
    const flip = spaceBelow < wanted && spaceAbove > spaceBelow;
    const room = Math.max(flip ? spaceAbove : spaceBelow, 120);
    setPosition({
      left: rect.left,
      minWidth: rect.width,
      maxHeight: Math.min(POPUP_MAX_HEIGHT, room),
      ...(flip
        ? { bottom: viewportHeight - rect.top + POPUP_GAP, top: undefined }
        : { top: rect.bottom + POPUP_GAP, bottom: undefined }),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition, filtered.length]);

  useEffect(() => {
    if (!expanded || activeIndex < 0) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: 'nearest' });
    // optionId is derived from a stable id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, activeIndex]);

  // ---- render --------------------------------------------------------------

  const status = !open
    ? ''
    : hasResults
      ? `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'} available`
      : emptyMessage;

  const listbox = (
    <>
      <ul
        ref={listboxRef}
        id={listboxId}
        role="listbox"
        aria-labelledby={ids.labelId}
        className={dropdownStyles.listbox}
        style={position}
        hidden={!expanded}
        // Keep focus in the input while clicking options or the scrollbar.
        onMouseDown={(event) => event.preventDefault()}
      >
        {filtered.map((option, index) => (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <li
            key={option.value}
            id={optionId(index)}
            role="option"
            aria-selected={option.value === selectedValue}
            aria-disabled={option.disabled || undefined}
            data-active={index === activeIndex || undefined}
            className={dropdownStyles.option}
            onClick={() => {
              selectFiltered(index);
              inputRef.current?.focus();
            }}
            onMouseMove={() => {
              if (!option.disabled && index !== activeIndex) setActiveIndex(index);
            }}
          >
            <span className={dropdownStyles.optionLabel}>{option.label}</span>
            {option.value === selectedValue && (
              <svg
                className={dropdownStyles.check}
                viewBox="0 0 20 20"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 10.5 3.5 3.5 7.5-8"
                />
              </svg>
            )}
          </li>
        ))}
      </ul>
      {open && !hasResults && (
        // The live region announces this; keep it out of the accessibility tree twice.
        <div
          aria-hidden="true"
          className={cx(dropdownStyles.listbox, styles.empty)}
          style={position}
        >
          {emptyMessage}
        </div>
      )}
    </>
  );

  return (
    <Field
      ids={ids}
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      disabled={disabled}
      className={className}
    >
      <div ref={controlRef} className={styles.control}>
        <input
          ref={inputRef}
          id={ids.controlId}
          type="text"
          role="combobox"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className={cx(inputStyles.input, styles.input)}
          value={inputText}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listboxId}
          aria-activedescendant={expanded && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          aria-describedby={ids.describedBy}
          aria-invalid={error ? true : undefined}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={() => {
            if (!disabled && !open) setOpen(true);
          }}
          onBlur={handleBlur}
        />
        <svg className={styles.chevron} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m5 7.5 5 5 5-5"
          />
        </svg>
        {name && <input type="hidden" name={name} value={selectedValue ?? ''} disabled={disabled} />}
      </div>
      <div role="status" aria-live="polite" className={styles.visuallyHidden}>
        {status}
      </div>
      {portalTarget ? createPortal(listbox, portalTarget) : null}
    </Field>
  );
}
