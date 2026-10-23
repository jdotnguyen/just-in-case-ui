import { useId } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Field.module.css';

export interface FieldIds {
  controlId: string;
  labelId: string;
  helperId: string;
  errorId: string;
  /** Value for aria-describedby (error first), or undefined if empty. */
  describedBy: string | undefined;
}

/** Generates the ids that link a control to its label, helper and error text. */
export function useFieldIds(options: {
  id?: string;
  helperText?: ReactNode;
  error?: ReactNode;
  describedBy?: string;
}): FieldIds {
  const generated = useId();
  // React's generated ids contain characters (":" or "«»") that are awkward
  // in CSS selectors, so keep only safe ones.
  const controlId = options.id ?? `jic-${generated.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const helperId = `${controlId}-helper`;
  const errorId = `${controlId}-error`;
  const describedBy =
    [options.error ? errorId : null, options.helperText ? helperId : null, options.describedBy]
      .filter(Boolean)
      .join(' ') || undefined;
  return { controlId, labelId: `${controlId}-label`, helperId, errorId, describedBy };
}

/** Visual-only required mark. The control itself carries required semantics. */
export function RequiredMark() {
  return (
    <span className={styles.required} aria-hidden="true">
      {' '}
      *
    </span>
  );
}

export function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cx(styles.errorIcon, className)}
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M10 1.667a8.333 8.333 0 1 0 0 16.666 8.333 8.333 0 0 0 0-16.666Zm.833 12.5H9.167V12.5h1.666v1.667Zm0-3.334H9.167V5.833h1.666v5Z"
      />
    </svg>
  );
}

/** Helper text and error message, with the ids from useFieldIds. */
export function FieldMessages({
  ids,
  helperText,
  error,
}: {
  ids: Pick<FieldIds, 'helperId' | 'errorId'>;
  helperText?: ReactNode;
  error?: ReactNode;
}) {
  return (
    <>
      {helperText && (
        <p className={styles.helper} id={ids.helperId}>
          {helperText}
        </p>
      )}
      {error && (
        <p className={styles.error} id={ids.errorId}>
          <ErrorIcon />
          <span>{error}</span>
        </p>
      )}
    </>
  );
}

export interface FieldProps {
  ids: FieldIds;
  label: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  /**
   * `label` uses a native <label for>. Use `span` for custom controls that
   * are named with aria-labelledby instead, plus onLabelClick to move focus.
   */
  labelElement?: 'label' | 'span';
  onLabelClick?: () => void;
  children: ReactNode;
}

/** Shared layout for labelled form controls: label, control, helper, error. */
export function Field({
  ids,
  label,
  helperText,
  error,
  required,
  disabled,
  className,
  labelElement = 'label',
  onLabelClick,
  children,
}: FieldProps) {
  const labelContent = (
    <>
      {label}
      {required && <RequiredMark />}
    </>
  );

  return (
    <div className={cx(styles.field, className)} data-disabled={disabled || undefined}>
      {labelElement === 'label' ? (
        <label className={styles.label} id={ids.labelId} htmlFor={ids.controlId}>
          {labelContent}
        </label>
      ) : (
        // Mouse convenience only; keyboard users reach the control directly.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <span className={styles.label} id={ids.labelId} onClick={onLabelClick}>
          {labelContent}
        </span>
      )}
      {children}
      <FieldMessages ids={ids} helperText={helperText} error={error} />
    </div>
  );
}

export interface FieldsetFieldProps {
  ids: FieldIds;
  legend: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  /** `radiogroup` allows aria-invalid / aria-required on the fieldset. */
  role?: 'radiogroup';
  className?: string;
  children: ReactNode;
}

/** Shared layout for groups of controls: fieldset, legend, options, helper, error. */
export function FieldsetField({
  ids,
  legend,
  helperText,
  error,
  required,
  disabled,
  orientation = 'vertical',
  role,
  className,
  children,
}: FieldsetFieldProps) {
  const isRadioGroup = role === 'radiogroup';
  return (
    <fieldset
      id={ids.controlId}
      className={cx(styles.fieldset, className)}
      role={role}
      disabled={disabled}
      aria-describedby={ids.describedBy}
      // Only valid on radiogroup; checkbox groups mark each checkbox instead.
      aria-invalid={isRadioGroup && error ? true : undefined}
      aria-required={isRadioGroup && required ? true : undefined}
      data-disabled={disabled || undefined}
    >
      <legend className={styles.legend} id={ids.labelId}>
        {legend}
        {required && <RequiredMark />}
      </legend>
      <div className={styles.options} data-orientation={orientation}>
        {children}
      </div>
      <FieldMessages ids={ids} helperText={helperText} error={error} />
    </fieldset>
  );
}
