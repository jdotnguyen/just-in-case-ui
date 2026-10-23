import { useCallback, useState } from 'react';

/** A polite live region that reports the last thing the user did. */
export function useActionLog(initial = 'Nothing pressed yet.') {
  const [message, setMessage] = useState(initial);
  const log = useCallback((text: string) => setMessage(text), []);
  const view = (
    <p className="action-log" role="status">
      {message}
    </p>
  );
  return [view, log] as const;
}
