import { useEffect, useState } from 'react';

/** Subscribe to a media query. Safe during server rendering (returns `initial`). */
export function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(() => (typeof window === 'undefined' ? initial : window.matchMedia(query).matches));

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
