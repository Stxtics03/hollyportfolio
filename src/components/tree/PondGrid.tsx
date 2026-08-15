/**
 * Pond grid.
 *
 * Ported from Lakshya Kumar's portfolio (github.com/27lakshay/lakshyakumar)
 * with the author's permission. Adapted from Next.js to this Vite project:
 * `"use client"` dropped, import aliases rewritten, `cn` replaced with a
 * template string, `next-themes` replaced by reading this project's
 * `data-theme` attribute, and reduced-motion read from our hook.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import {
  addRipple,
  buildBackgroundSquares,
  drawBackgroundSquares,
  pruneRipples,
  type BackgroundRipple,
  type BackgroundSquare,
} from './pondGridDraw';
import { SWAY_EASE, type TreeAnchor } from './treeConstants';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * The project's theme is an attribute on <html> rather than a context, so the
 * grid watches that directly. Same result as the original's `next-themes`
 * lookup, one less dependency.
 */
function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.dataset.theme !== 'light',
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.dataset.theme !== 'light');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export type PondMouse = {
  x: number;
  y: number;
  active: boolean;
};

export type PondGridHandle = {
  addRipple: (x: number, y: number) => void;
};

type PondGridProps = {
  className?: string;
  anchor?: TreeAnchor;
  mouse: PondMouse;
  ariaHidden?: boolean;
};

const PondGrid = forwardRef<PondGridHandle, PondGridProps>(function PondGrid(
  { className = '', anchor = 'bottom-right', mouse, ariaHidden = true },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark = useIsDark();
  const reducedMotion = useReducedMotion();
  const isDarkRef = useRef(isDark);
  const mouseRef = useRef(mouse);
  const pondDirtyRef = useRef(true);
  const addRippleRef = useRef<(x: number, y: number) => void>(() => {});

  useImperativeHandle(ref, () => ({
    addRipple: (x: number, y: number) => {
      addRippleRef.current(x, y);
    },
  }));

  useEffect(() => {
    isDarkRef.current = isDark;
    pondDirtyRef.current = true;
  }, [isDark]);

  useEffect(() => {
    mouseRef.current = mouse;
  }, [mouse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let squares: BackgroundSquare[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    /**
     * DEVIATION from the original, deliberate: there the grid grows outward
     * from the corner over `GROWTH_MS` alongside the tree. Here the grid is a
     * substrate the whole section sits on and is wanted filled from the
     * start — only the tree grows. It also removes a failure mode, since the
     * grow-in needs a couple of seconds of uninterrupted frames to complete
     * and renders as an empty field if it doesn't get them.
     */
    let bgRevealRadius = Number.MAX_SAFE_INTEGER;
    let strength = 0;
    let lastDrawStrength = -1;
    const ripples: BackgroundRipple[] = [];

    addRippleRef.current = (x: number, y: number) => {
      if (reducedMotion) return;
      addRipple(ripples, x, y, performance.now());
      pondDirtyRef.current = true;
    };

    const rebuild = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const seed = Math.floor(width * 1000 + height);
      squares = buildBackgroundSquares(width, height, seed, anchor);
      // Filled from the first frame — see the note on `bgRevealRadius`.
      bgRevealRadius = Number.MAX_SAFE_INTEGER;
      pondDirtyRef.current = true;

      if (reducedMotion) {
        tick(performance.now());
      }
    };

    const needsRedraw = (): boolean => {
      if (pondDirtyRef.current) return true;
      if (reducedMotion) return false;
      if (ripples.length > 0) return true;
      if (strength > 0.001) return true;
      if (Math.abs(strength - lastDrawStrength) > 0.001) return true;
      return false;
    };

    const tick = (now: number) => {
      if (!reducedMotion) {
        pruneRipples(ripples, now);
      }

      const mouseState = mouseRef.current;
      const targetStrength = mouseState.active && !reducedMotion ? 1 : 0;
      strength += (targetStrength - strength) * SWAY_EASE;

      if (needsRedraw()) {
        ctx.clearRect(0, 0, width, height);
        drawBackgroundSquares(
          ctx,
          squares,
          now,
          reducedMotion,
          bgRevealRadius,
          isDarkRef.current,
          mouseState.x,
          mouseState.y,
          strength,
          ripples,
          width,
          height,
        );

        lastDrawStrength = strength;
        pondDirtyRef.current = false;
      }

      if (!reducedMotion) {
        raf = requestAnimationFrame(tick);
      }
    };

    rebuild();
    if (!reducedMotion) {
      raf = requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(rebuild);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [anchor, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`block h-full w-full bg-transparent ${className}`}
      aria-hidden={ariaHidden}
    />
  );
});

export default PondGrid;
