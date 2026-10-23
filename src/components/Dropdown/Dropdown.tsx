import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx';
import { Field, useFieldIds } from '../Field/Field';
import styles from './Dropdown.module.css';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  /** Visible label. Required. */
  label: ReactNode;
  options: DropdownOption[];
  /** Controlled value. Pair with onChange. */
  value?: string | null;
  /** Initial value when uncontrolled. */
  defaultValue?: string | null;
  /** Called only when the user picks a different value. */
  onChange?: (value: string) => void;
  /** Shown when nothing is selected. */
  placeholder?: string;
  helperText?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Form field name. When set, the value is submitted with native forms. */
  name?: string;
  id?: string;
  className?: string;
  onBlur?: () => void;
}

const PAGE_SIZE = 10;
const TYPEAHEAD_RESET_MS = 500;
const POPUP_GAP = 4;
const POPUP_MAX_HEIGHT = 280;

type Position = Pick<CSSProperties, 'top' | 'bottom' | 'left' | 'minWidth' | 'maxHeight'>;

/**
 * Single-select dropdown following the WAI-ARIA APG "Select-Only Combobox"
 * pattern. DOM focus stays on the combobox; the active option is conveyed
 * with aria-activedescendant.
 */
export function Dropdown({
  label,
  options,
  value,
  defaultValue = null,
  onChange,
  placeholder = 'Select an option',
  helperText,
  error,
  required,
  disabled,
  name,
  id,
  className,
  onBlur,
}: DropdownProps) {
  const ids = useFieldIds({ id, helperText, error });
  const listboxId = `${ids.controlId}-listbox`;
  const optionId = (index: number) => `${ids.controlId}-option-${index}`;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | null>(defaultValue);
  const selectedValue = isControlled ? value : internalValue;
  const selectedIndex = options.findIndex((option) => option.value === selectedValue);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<Position>({});

  const comboRef = useRef<HTMLDivElement>(null);
  // Portal the listbox to <body>, or into the nearest <dialog>: a modal dialog
  // makes everything outside it inert, so a list in <body> couldn't be used.
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    setPortalTarget(comboRef.current?.closest('dialog') ?? document.body);
  }, []);
  const listboxRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ buffer: '', timer: 0 as ReturnType<typeof setTimeout> | 0 });

  // ---- option helpers -------------------------------------------------------

  const isEnabled = useCallback(
    (index: number) => index >= 0 && index < options.length && !options[index].disabled,
    [options],
  );

  const firstEnabled = () => options.findIndex((option) => !option.disabled);
  const lastEnabled = () => {
    for (let i = options.length - 1; i >= 0; i -= 1) if (!options[i].disabled) return i;
    return -1;
  };

  /** Move `steps` enabled options from `from`, stopping at the ends (no wrap). */
  function moveBy(from: number, steps: number): number {
    const direction = Math.sign(steps);
    let index = from;
    let remaining = Math.abs(steps);
    let last = from;
    while (remaining > 0) {
      index += direction;
      if (index < 0 || index >= options.length) break;
      if (!options[index].disabled) {
        last = index;
        remaining -= 1;
      }
    }
    return isEnabled(last) ? last : from;
  }

  function initialActive() {
    return isEnabled(selectedIndex) ? selectedIndex : firstEnabled();
  }

  // ---- open / close / select ---------------------------------------------

  function openWith(index: number) {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(index);
  }

  function close() {
    setOpen(false);
    setActiveIndex(-1);
  }

  function selectIndex(index: number) {
    if (!isEnabled(index)) return;
    const next = options[index].value;
    if (next !== selectedValue) {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    }
  }

  // ---- type-ahead ---------------------------------------------------------

  function typeaheadMatch(char: string): number {
    const state = typeahead.current;
    if (state.timer) clearTimeout(state.timer);
    state.buffer += char.toLowerCase();
    state.timer = setTimeout(() => {
      state.buffer = '';
      state.timer = 0;
    }, TYPEAHEAD_RESET_MS);

    const buffer = state.buffer;
    // Repeating one character ("ccc") cycles through options starting with it.
    const repeated = buffer.length > 1 && [...buffer].every((c) => c === buffer[0]);
    const search = repeated ? buffer[0] : buffer;
    const current = open ? activeIndex : selectedIndex;
    // A fresh single character (or a repeat) searches from the next option, so
    // pressing "c" again moves on; a longer string can match the current one.
    const startAfterCurrent = buffer.length === 1 || repeated;
    const begin = current < 0 ? 0 : startAfterCurrent ? current + 1 : current;

    for (let i = 0; i < options.length; i += 1) {
      const index = (begin + i) % options.length;
      if (isEnabled(index) && options[index].label.toLowerCase().startsWith(search)) {
        return index;
      }
    }
    return -1;
  }

  useEffect(() => {
    const state = typeahead.current;
    return () => {
      if (state.timer) clearTimeout(state.timer);
    };
  }, []);

  // ---- keyboard -----------------------------------------------------------

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    const { key, altKey, ctrlKey, metaKey } = event;
    const isPrintable = key.length === 1 && !ctrlKey && !metaKey && !altKey;
    const typing = typeahead.current.buffer.length > 0;

    if (!open) {
      switch (key) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Enter':
          event.preventDefault();
          openWith(initialActive());
          return;
        case ' ':
          event.preventDefault();
          if (typing) {
            const match = typeaheadMatch(' ');
            openWith(match >= 0 ? match : initialActive());
          } else {
            openWith(initialActive());
          }
          return;
        case 'Home':
          event.preventDefault();
          openWith(firstEnabled());
          return;
        case 'End':
          event.preventDefault();
          openWith(lastEnabled());
          return;
        default:
          if (isPrintable) {
            event.preventDefault();
            const match = typeaheadMatch(key);
            openWith(match >= 0 ? match : initialActive());
          }
          return;
      }
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((current) => moveBy(current < 0 ? -1 : current, 1));
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (altKey) {
          selectIndex(activeIndex);
          close();
          return;
        }
        setActiveIndex((current) => (current < 0 ? lastEnabled() : moveBy(current, -1)));
        return;
      case 'Home':
        event.preventDefault();
        setActiveIndex(firstEnabled());
        return;
      case 'End':
        event.preventDefault();
        setActiveIndex(lastEnabled());
        return;
      case 'PageDown':
        event.preventDefault();
        setActiveIndex((current) => moveBy(current, PAGE_SIZE));
        return;
      case 'PageUp':
        event.preventDefault();
        setActiveIndex((current) => moveBy(current, -PAGE_SIZE));
        return;
      case 'Enter':
        event.preventDefault();
        selectIndex(activeIndex);
        close();
        return;
      case ' ':
        event.preventDefault();
        if (typing) {
          const match = typeaheadMatch(' ');
          if (match >= 0) setActiveIndex(match);
          return;
        }
        selectIndex(activeIndex);
        close();
        return;
      case 'Escape':
        event.preventDefault();
        close();
        return;
      case 'Tab':
        // Select and let focus move on naturally.
        selectIndex(activeIndex);
        close();
        return;
      default:
        if (isPrintable) {
          event.preventDefault();
          const match = typeaheadMatch(key);
          if (match >= 0) setActiveIndex(match);
        }
    }
  }

  // ---- pointer ------------------------------------------------------------

  function handleTriggerClick() {
    if (disabled) return;
    if (open) close();
    else openWith(initialActive());
  }

  function handleOptionClick(index: number) {
    if (!isEnabled(index)) return;
    selectIndex(index);
    close();
    comboRef.current?.focus();
  }

  function handleBlur() {
    // Clicks inside the listbox keep focus on the combobox (see onMouseDown
    // below), so any blur means focus really left: close without selecting.
    if (open) close();
    onBlur?.();
  }

  // ---- positioning & scrolling --------------------------------------------

  const updatePosition = useCallback(() => {
    const combo = comboRef.current;
    const listbox = listboxRef.current;
    if (!combo || !listbox) return;
    const rect = combo.getBoundingClientRect();
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
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const element = document.getElementById(optionId(activeIndex));
    element?.scrollIntoView?.({ block: 'nearest' });
    // optionId is derived from a stable id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  // ---- render -------------------------------------------------------------

  const listbox = (
    // Keyboard interaction lives on the combobox (aria-activedescendant), per APG.
    <ul
      ref={listboxRef}
      id={listboxId}
      role="listbox"
      aria-labelledby={ids.labelId}
      className={styles.listbox}
      style={position}
      hidden={!open}
      // Keep focus on the combobox while clicking options or the scrollbar.
      onMouseDown={(event) => event.preventDefault()}
    >
      {options.map((option, index) => (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <li
          key={option.value}
          id={optionId(index)}
          role="option"
          aria-selected={index === selectedIndex}
          aria-disabled={option.disabled || undefined}
          data-active={index === activeIndex || undefined}
          className={styles.option}
          onClick={() => handleOptionClick(index)}
          onMouseMove={() => {
            if (isEnabled(index) && index !== activeIndex) setActiveIndex(index);
          }}
        >
          <span className={styles.optionLabel}>{option.label}</span>
          {index === selectedIndex && (
            <svg className={styles.check} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
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
      labelElement="span"
      onLabelClick={() => comboRef.current?.focus()}
    >
      <div className={styles.control}>
        <div
          ref={comboRef}
          id={ids.controlId}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          className={styles.trigger}
          aria-labelledby={ids.labelId}
          aria-describedby={ids.describedBy}
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          data-open={open || undefined}
          onKeyDown={handleKeyDown}
          onClick={handleTriggerClick}
          onBlur={handleBlur}
        >
          <span className={cx(styles.value, !selectedOption && styles.placeholder)}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
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
        </div>
        {(name || required) && (
          // Native form participation and required validation. Hidden from
          // assistive tech; the combobox above is the accessible control.
          <select
            className={styles.nativeSelect}
            name={name}
            value={selectedValue ?? ''}
            required={required}
            disabled={disabled}
            aria-hidden="true"
            tabIndex={-1}
            onChange={() => {}}
            onFocus={() => comboRef.current?.focus()}
          >
            <option value="" />
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
      {portalTarget ? createPortal(listbox, portalTarget) : null}
    </Field>
  );
}
