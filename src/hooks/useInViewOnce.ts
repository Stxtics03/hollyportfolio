import { useEffect, useRef, useState } from 'react';

type Options = {
  /** Fraction of the element that must be visible before it counts. */
  threshold?: number;
  /** Shrinks the viewport box, so reveals fire slightly before the true edge. */
  rootMargin?: string;
  /** Skip observing entirely and report visible immediately. */
  disabled?: boolean;
};

/**
 * Fires once and then stops observing — sections do not re-animate when you
 * scroll back up. That replay is the single most common way a reveal
 * animation turns from "considered" into "restless".
 */
export function useInViewOnce<T extends HTMLElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  disabled = false,
}: Options = {}): { ref: React.RefObject<T>; inView: boolean } {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(disabled);

  useEffect(() => {
    if (disabled) {
      setInView(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, disabled]);

  return { ref, inView };
}
