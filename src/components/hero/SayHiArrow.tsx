import { motion } from 'framer-motion';
import { useInViewOnce } from '../../hooks/useInViewOnce';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/** Seconds the arrow takes to draw itself. */
const DRAW_SECONDS = 0.7;

/** Box the note is drawn in. The arrow's tip sits at (104, 58) inside it. */
const BOX = { width: 120, height: 80 };
/**
 * Vertical offset that lands the arrow's tip on the tile row's centre line.
 * The tiles are 44px tall, so their centre is 22px down; the tip is 58px down
 * inside this box, and the difference is what pulls the note up.
 */
export const SAY_HI_TIP_OFFSET = 22 - 58;

/**
 * The handwritten `say hi` and its arrow, drawn as one box whose arrow tip is
 * at a known point — which is what lets the row align the note against the
 * tiles instead of guessing at absolute offsets.
 *
 * The face and colour are set inline rather than through Tailwind classes on
 * purpose: both would otherwise depend on tokens added to
 * `tailwind.config.ts`, and a dev server started before that edit serves CSS
 * without them, silently rendering this note in the site's pixel face. The
 * `@font-face` and the custom property both live in `index.css`, which Vite
 * always reprocesses.
 */
export function SayHiArrow({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const reducedMotion = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>({
    threshold: 0.4,
    disabled: reducedMotion,
  });

  const drawn = inView || reducedMotion;

  return (
    <div
      ref={ref}
      className={`pointer-events-none relative shrink-0 select-none ${className}`}
      style={{
        width: BOX.width,
        height: BOX.height,
        color: 'rgb(var(--color-note))',
        ...style,
      }}
      aria-hidden
    >
      <span
        className="absolute top-0 left-0 block"
        style={{
          fontFamily: "'Caveat', ui-rounded, cursive",
          fontSize: 30,
          lineHeight: 1,
          // None of the site's mono tracking should reach handwriting.
          letterSpacing: 0,
          transform: 'rotate(-4deg)',
          transformOrigin: 'left center',
        }}
      >
        say hi
      </span>

      <svg
        width={BOX.width}
        height={BOX.height}
        viewBox={`0 0 ${BOX.width} ${BOX.height}`}
        fill="none"
        className="absolute inset-0"
      >
        {/* Drops out from under the text, then flattens out and runs right to
            meet the tiles head-on rather than sailing past underneath them. */}
        <motion.path
          d="M10 30C16 52 44 66 104 58"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          initial={reducedMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: drawn ? 1 : 0 }}
          transition={{ duration: DRAW_SECONDS, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Angled off the curve's final direction so it reads as one stroke
            rather than a chevron dropped on the end. */}
        <motion.path
          d="M92.7 54 104 58 93.7 64.1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reducedMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: drawn ? 1 : 0 }}
          transition={{
            duration: DRAW_SECONDS * 0.4,
            delay: reducedMotion ? 0 : DRAW_SECONDS * 0.8,
            ease: 'easeOut',
          }}
        />
      </svg>
    </div>
  );
}
