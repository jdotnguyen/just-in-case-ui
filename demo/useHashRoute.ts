import { useEffect, useState } from 'react';

function readPath(validPaths: readonly string[], fallback: string): string {
  const path = window.location.hash.replace(/^#\/?/, '');
  return validPaths.includes(path) ? path : fallback;
}

/**
 * Minimal hash router: `#/button` → "button". Unknown hashes fall back.
 * Deep links and browser back/forward work through `hashchange`.
 */
export function useHashRoute(validPaths: readonly string[], fallback: string): string {
  const [path, setPath] = useState(() => readPath(validPaths, fallback));

  useEffect(() => {
    const onChange = () => setPath(readPath(validPaths, fallback));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [validPaths, fallback]);

  return path;
}
