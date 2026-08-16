import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { GrainOverlay } from './GrainOverlay';
import { EASE_BREATH, EASE_LAUNCH, EASE_REVEAL } from '../../lib/easings';
import type { ExitPhase } from '../../lib/exitPhase';

export type BootCardTuning = {
  /** Card width. The height follows from `heightRatio`. */
  width: string;
  /** Height as a fraction of width. SS1's proportion is roughly 0.52–0.56. */
  heightRatio: number;
  /** Never let the card outgrow the viewport on short screens. */
  maxHeight: string;
  /** Seconds for the sheen to travel once around the border. */
  sheenSeconds: number;
  /** Seconds for one inhale + exhale of the outer glow. */
  breathSeconds: number;
  /**
   * The card's edge: one flat color, same family as the field behind it. The
   * card should separate from the background by value, not by hue.
   */
  edgeColor: string;
  /**
   * Neutral halo behind the card. 0 renders nothing at all behind the card,
   * which is the default — the edge alone does the separating.
   */
  haloAlpha: number;
  /**
   * Grain on the card's own surface, under the content. Separate from both
   * background and type grain: its real job is dithering the fill gradient,
   * which bands visibly in 8-bit without it.
   */
  surfaceGrain: number;
  entranceDuration: number;
  entranceDelay: number;
  /** Seconds the card takes to expand past the viewport on exit. */
  expandSeconds: number;
  /** Seconds of the plain fade used on a repeat visit. */
  fadeSeconds: number;
};

type BootCardProps = {
  tuning: BootCardTuning;
  /** Kill the sheen and the breath. */
  still?: boolean;
  /**
   * Skip the entrance entirely and render the card at its final state. Used by
   * debug mode, where `initial` values would otherwise leave the card at
   * `opacity: 0` with no frame loop to animate it away.
   */
  staticRender?: boolean;
  /** Where the exit timeline currently is. */
  exitPhase?: ExitPhase;
  children?: ReactNode;
};

/**
 * The card: shape from SS3, contents from SS1.
 *
 * Deliberately flat — no tilt, no perspective, no bevel. The only thing
 * separating it from the page is a 1px hairline, a single inset highlight
 * along the top edge, and a wide acid glow underneath it, which is what makes
 * it read as lit from within rather than embossed on top.
 *
 * Everything that moves here moves in millimetres: the glow breathes on a slow
 * opacity cycle, and one narrow highlight travels the border every few seconds.
 * Both are `opacity`/`transform` only — no box-shadow animation, which would
 * repaint the whole card every frame.
 */
export function BootCard({
  tuning,
  still = false,
  staticRender = false,
  exitPhase = 'idle',
  children,
}: BootCardProps) {
  const height = `min(calc(${tuning.width} * ${tuning.heightRatio}), ${tuning.maxHeight})`;
  const rootRef = useRef<HTMLDivElement>(null);

  /**
   * How far the card must scale to swallow the viewport. Measured up front and
   * on resize — never while the expansion is running, where a changing target
   * would visibly re-aim the animation mid-flight.
   */
  const [coverScale, setCoverScale] = useState(3);
  useEffect(() => {
    const measure = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;
      setCoverScale(
        Math.max(window.innerWidth / rect.width, window.innerHeight / rect.height) * 1.15,
      );
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const expanding = exitPhase === 'expand' || exitPhase === 'flash' || exitPhase === 'done';
  const fading = exitPhase === 'fade';

  const animate = expanding
    ? { opacity: 1, scale: coverScale, y: 0 }
    : fading
      ? { opacity: 0, scale: 1, y: 0 }
      : { opacity: 1, scale: 1, y: 0 };

  const transition = expanding
    ? { duration: tuning.expandSeconds, ease: EASE_LAUNCH }
    : fading
      ? { duration: tuning.fadeSeconds, ease: EASE_REVEAL }
      : {
          duration: tuning.entranceDuration,
          delay: tuning.entranceDelay,
          ease: EASE_REVEAL,
        };

  return (
    <motion.div
      ref={rootRef}
      className="relative"
      style={{ width: tuning.width, height }}
      initial={staticRender ? false : { opacity: 0, scale: 0.965, y: 14 }}
      animate={animate}
      transition={transition}
    >
      {/* Optional neutral halo. Off by default (`haloAlpha: 0`) — nothing
          renders behind the card. Shaped as a ring rather than a disc, since
          the card's opaque fill would swallow a disc's centre and force the
          alpha up until it flooded the whole frame. */}
      {tuning.haloAlpha > 0 ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-[18%] rounded-[96px]"
          style={{
            background: `radial-gradient(ellipse at 50% 52%, transparent 0%, transparent 33%, rgba(242,242,242,${tuning.haloAlpha}) 42%, rgba(242,242,242,${tuning.haloAlpha * 0.25}) 52%, transparent 64%)`,
            filter: 'blur(36px)',
            willChange: 'opacity',
          }}
          initial={staticRender ? false : { opacity: 0 }}
          animate={still ? { opacity: 0.8 } : { opacity: [0.62, 1, 0.62] }}
          transition={
            still
              ? { duration: tuning.entranceDuration, delay: tuning.entranceDelay }
              : {
                  duration: tuning.breathSeconds,
                  repeat: Infinity,
                  ease: EASE_BREATH,
                  delay: tuning.entranceDelay,
                }
          }
        />
      ) : null}

      {/* The card surface itself. */}
      <motion.div
        className="relative h-full w-full overflow-hidden border"
        style={{
          // "Barely-there" is the brief: two stops, four points of luminance
          // between them.
          background:
            'linear-gradient(180deg, rgb(var(--color-ink-lift)) 0%, rgb(var(--color-ink-soft)) 55%, rgb(var(--color-ink)) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        // The radius relaxing to 0 is what turns the card into the page
        // surface. The border goes with it — scaled up 3×, a 1px hairline
        // would read as a 3px frame around the whole viewport.
        initial={false}
        animate={{
          borderRadius: expanding ? 0 : 28,
          // A flat neutral edge, not a translucent white — an
          // `rgba(255,255,255,…)` hairline picks up whatever is behind it,
          // which is how the border ended up looking tinted.
          borderColor: expanding ? 'rgba(28,28,28,0)' : tuning.edgeColor,
        }}
        transition={{
          duration: expanding ? tuning.expandSeconds : 0.3,
          ease: EASE_LAUNCH,
        }}
      >
        {/* Under the content, never over it: this dithers the fill's banding
            without ever touching a glyph. */}
        <GrainOverlay
          opacity={tuning.surfaceGrain}
          frequency={0.95}
          blend="screen"
          animated={!still}
        />
        <div className="relative h-full w-full">{children}</div>
      </motion.div>

      {/* Travelling sheen: a conic gradient clipped to a 1px ring by masking
          the content box out of the border box. Sits above the surface so it
          rides on top of the static hairline. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-card"
        style={{
          padding: '1px',
          // ~30° of arc, so the highlight passes as a glint rather than
          // dragging a lit quarter of the border around with it. Neutral bone
          // only — no acid in the edge.
          background: `conic-gradient(from var(--sheen-angle) at 50% 50%, transparent 0deg, transparent 330deg, rgba(242,242,242,0.22) 349deg, rgba(242,242,242,0.34) 357deg, transparent 360deg)`,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
          animation: still ? undefined : `sheen-sweep ${tuning.sheenSeconds}s linear infinite`,
          // The glint has no business surviving into the expansion — it would
          // stretch into a lit band across the whole viewport.
          opacity: still || exitPhase !== 'idle' ? 0 : 1,
          transition: 'opacity 200ms linear',
        }}
      />
    </motion.div>
  );
}
