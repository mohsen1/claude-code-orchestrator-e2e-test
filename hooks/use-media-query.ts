import { useState, useEffect } from 'react';

/**
 * Custom hook to track media query matches
 * Useful for responsive design adjustments
 *
 * @param query - CSS media query string (e.g., "(max-width: 768px)")
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const updateMatches = (event: MediaQueryListEvent | MediaQueryList) => {
      setMatches(event.matches);
    };

    // Set initial value
    updateMatches(mediaQueryList);

    // Listen for changes
    mediaQueryList.addEventListener('change', updateMatches);

    // Clean up listener
    return () => {
      mediaQueryList.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}
