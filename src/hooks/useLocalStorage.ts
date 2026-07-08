import { useCallback, useState } from 'react';

/**
 * State hook that mirrors its value to `localStorage` under `key`.
 *
 * The initial value is read from storage on first render (falling back to
 * `initialValue`), and every update is persisted as JSON. Read/write failures
 * are swallowed so a disabled or full storage never breaks the app.
 *
 * @param key Storage key.
 * @param initialValue Value used when nothing is stored (or parsing fails).
 * @returns A `[value, setValue]` tuple; `setValue` accepts a value or updater.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)): void => {
      setState(prev => {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Ignore storage write failures (private mode, quota, etc.).
        }
        return next;
      });
    },
    [key]
  );

  return [state, setValue];
}
