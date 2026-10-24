import { useCallback, useState } from 'react';

/**
 * State that can be controlled (`value` given) or uncontrolled (`defaultValue`).
 * The setter always calls `onChange`; callers decide whether a change happened.
 */
export function useControllableState<T>(options: {
  value: T | undefined;
  defaultValue: T;
  onChange?: (value: T) => void;
}): readonly [T, (next: T) => void] {
  const { value, defaultValue, onChange } = options;
  const [internal, setInternal] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [current, set] as const;
}
