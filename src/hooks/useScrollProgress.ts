import { useEffect, useRef, useState } from 'react';

/**
 * How far an element has travelled through the viewport, 0 → 1.
 *
 * 0 when its top edge first reaches the bottom of the viewport, 1 when its
 * bottom edge leaves the top. Anything tied to this grows as you scroll and
 * ungrows as you scroll back, which is the point — it is a position, not a
 * timeline.
 *
 * Reads are batched into a `requestAnimationFrame` so a fast scroll can't
 * force more layout reads than there are frames.
 */
export function useScrollProgress<T extends HTMLElement>(): {
  ref: React.RefObject<T>;
  progress: number;
} {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;
    let queued = false;

    const measure = () => {
      queued = false;
      const rect = element.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      if (total <= 0) return;

      const travelled = window.innerHeight - rect.top;
      setProgress(Math.min(Math.max(travelled / total, 0), 1));
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return { ref, progress };
}
