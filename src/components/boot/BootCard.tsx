import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { GrainOverlay } from './GrainOverlay';
import { EASE_BREATH, EASE_REVEAL } from '../../lib/easings';

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
  children,
}: BootCardProps) {
  const height = `min(calc(${tuning.width} * ${tuning.heightRatio}), ${tuning.maxHeight})`;

  return (
    <motion.div
      className="relative"
      style={{ width: tuning.width, height }}
      initial={staticRender ? false : { opacity: 0, scale: 0.965, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: tuning.entranceDuration,
        delay: tuning.entranceDelay,
        ease: EASE_REVEAL,
      }}
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
      <div
        className="relative h-full w-full overflow-hidden rounded-card border"
        style={{
          // "Barely-there" is the brief: two stops, four points of luminance
          // between them.
          background: 'linear-gradient(180deg, #101010 0%, #0E0E0E 55%, #0C0C0C 100%)',
          // A flat neutral edge, not a translucent white — a `rgba(255,255,255,…)`
          // hairline picks up whatever is behind it, which is how the border
          // ended up looking tinted.
          borderColor: tuning.edgeColor,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
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
      </div>

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
          opacity: still ? 0 : 1,
        }}
      />
    </motion.div>
  );
}
