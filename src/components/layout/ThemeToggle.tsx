import { useRef } from 'react';
import { flushSync } from 'react-dom';
import { motion } from 'framer-motion';
import { applyTheme, persistTheme, useTheme, type Theme } from '../../hooks/useTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Wipe timing, taken from `D:\Program\port` (`src/lib/theme-transition.ts`),
 * which is the version that actually reads as smooth.
 *
 * The circle travels from the toggle to the furthest corner — around 1800px on
 * a laptop — so easing matters more than duration. A circle's *area* grows
 * with the square of its radius, so the last stretch of radius is by far the
 * most screen changing per frame. `ease-out` puts the deceleration exactly
 * there. The curve this replaced, `cubic-bezier(0.4, 0, 0.2, 1)`, is the
 * standard ease-in-*out* — it held the circle back for the first third and
 * then flung it across the screen, which is what read as a stutter rather than
 * as a wipe. At 340ms there was also no room left to decelerate into.
 */
const WIPE_MS = 550;
const WIPE_EASE = 'ease-out';
/** Icon swap stays inside the wipe — a slower icon makes the press feel laggy. */
const ICON_SECONDS = 0.28;
/** The circle opens from a point, as in the source. */
const START_RADIUS = 0;

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

/**
 * Theme toggle with a circular reveal.
 *
 * The incoming theme is clipped in as a circle growing from the button's own
 * coordinates until it covers the furthest corner, so the swap reads as
 * originating from the thing you pressed rather than as the page blinking.
 *
 * The critical detail is what *doesn't* happen during the transition. The
 * palette is CSS variables hanging off one attribute on <html>, so the swap
 * itself is a single DOM write — no React render, no layout, no style
 * recalculation beyond repainting with different variable values. The only
 * state that changes in React is this button's own icon, and that is
 * deliberately owned here rather than at the app root: hoisting it made
 * `flushSync` re-render the entire site inside the transition's capture
 * window, which is a long main-thread task landing exactly where the animation
 * needs frames.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const isDark = theme === 'dark';
  /** A wipe already in flight. Starting a second one mid-flight stutters. */
  const wiping = useRef(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const doc = document as ViewTransitionDocument;
    const root = document.documentElement;
    const next: Theme = isDark ? 'light' : 'dark';

    /**
     * Suppresses every element's own colour transition, and the header's
     * backdrop blur, for the duration of the swap. Without the first, elements
     * carrying `transition-colors` animate to the new palette *after* the wipe
     * has revealed them — a second, slower stage tacked onto the end. Without
     * the second, both snapshots contain a live blur, which is the single most
     * expensive thing that can be inside a view transition.
     */
    const freeze = () => root.classList.add('theme-switching');
    const thaw = () => root.classList.remove('theme-switching');

    // A view transition in a hidden tab never gets frames to animate with, and
    // can leave a stale snapshot pinned over the page.
    if (reducedMotion || document.hidden || typeof doc.startViewTransition !== 'function') {
      freeze();
      setTheme(next);
      // Two frames: one for the class to apply, one for the paint to land. The
      // timeout is a backstop — rAF never fires in a background tab.
      requestAnimationFrame(() => requestAnimationFrame(thaw));
      window.setTimeout(thaw, 120);
      return;
    }

    if (wiping.current) {
      // Mid-wipe: swap without choreography rather than fighting the animation.
      setTheme(next);
      return;
    }
    wiping.current = true;
    freeze();

    // Origin: the centre of the button that was pressed.
    const rect = event.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const transition = doc.startViewTransition(() => {
      // The whole theme change, synchronously: one attribute write, plus a
      // render of this button and nothing else.
      applyTheme(next);
      flushSync(() => setTheme(next));
    });

    // Both promises reject if the transition is skipped — a second one
    // starting, or the tab being hidden mid-flight. The theme itself is
    // already applied by then, so there is nothing to undo; swallowing the
    // rejection just keeps it from surfacing as an unhandled one.
    transition.ready.then(
      () => {
        // Radius that reaches the furthest corner from the origin.
        const endRadius = Math.hypot(
          Math.max(originX, window.innerWidth - originX),
          Math.max(originY, window.innerHeight - originY),
        );

        document.documentElement.animate(
          {
            clipPath: [
              `circle(${START_RADIUS}px at ${originX}px ${originY}px)`,
              `circle(${endRadius}px at ${originX}px ${originY}px)`,
            ],
          },
          {
            duration: WIPE_MS,
            easing: WIPE_EASE,
            pseudoElement: '::view-transition-new(root)',
          },
        );
      },
      () => {},
    );

    const settle = () => {
      wiping.current = false;
      thaw();
      // The attribute is already correct; this only makes sure the choice is
      // on record even if the render above was interrupted.
      persistTheme(next);
    };
    transition.finished.then(settle, settle);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={!isDark}
      className="text-bone/55 hover:text-bone focus-ring rounded-[4px] p-1 transition-colors"
    >
      {/* Rotate-and-scale between the two marks rather than a crossfade —
          a crossfade would show a sun and a moon overlapping mid-swap. */}
      <motion.svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        animate={{ rotate: isDark ? 0 : 180 }}
        initial={false}
        transition={
          reducedMotion ? { duration: 0 } : { duration: ICON_SECONDS, ease: [0.4, 0, 0.2, 1] }
        }
      >
        {isDark ? (
          // Moon: the site is dark, pressing this brings light.
          <path d="M13 9.6A5.6 5.6 0 0 1 6.4 3a5.8 5.8 0 1 0 6.6 6.6Z" fill="currentColor" />
        ) : (
          <>
            <circle cx="8" cy="8" r="3.2" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="square">
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M13 3l-1.4 1.4M4.4 11.6L3 13" />
            </g>
          </>
        )}
      </motion.svg>
    </button>
  );
}
