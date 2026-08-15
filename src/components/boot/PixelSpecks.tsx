import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createRng, rangeFrom } from '../../lib/rng';
import { EASE_BREATH } from '../../lib/easings';

type Speck = {
  left: number;
  top: number;
  size: number;
  acid: boolean;
  delay: number;
  duration: number;
  drift: number;
  peak: number;
};

/**
 * Specks live in the frame's margins — never the middle third, where the card
 * and the dither mass are. Seeded, so the scatter is a fixed composition rather
 * than a different accident on every reload.
 */
function buildSpecks(seed: number, count: number): Speck[] {
  const rng = createRng(seed);
  const specks: Speck[] = [];

  for (let i = 0; i < count; i += 1) {
    // Alternate sides so neither margin ends up empty.
    const onLeft = i % 2 === 0;
    specks.push({
      left: onLeft ? rangeFrom(rng, 1.5, 15) : rangeFrom(rng, 85, 98),
      top: rangeFrom(rng, 3, 94),
      // 4px is the brief; a few 8px ones stop the field reading as uniform.
      size: rng() > 0.82 ? 8 : 4,
      acid: rng() > 0.68,
      delay: rangeFrom(rng, 0, 5),
      duration: rangeFrom(rng, 4, 9),
      drift: Math.round(rangeFrom(rng, 4, 16)),
      peak: rangeFrom(rng, 0.55, 1),
    });
  }

  return specks;
}

type PixelSpecksProps = {
  count?: number;
  seed?: number;
  /** Freeze drift + flicker. */
  still?: boolean;
  className?: string;
};

/**
 * Sparse acid/bone specks at the edges of the frame — the seasoning role SS2
 * gave its gold stars, rewritten as single pixels so it belongs to the same
 * language as the type and the dither.
 *
 * Drift is whole numbers of pixels only: a speck that lands on a half pixel
 * antialiases into a grey smudge and stops being a pixel.
 */
export const PixelSpecks = memo(function PixelSpecks({
  count = 14,
  seed = 8152026,
  still = false,
  className = '',
}: PixelSpecksProps) {
  const specks = useMemo(() => buildSpecks(seed, count), [seed, count]);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {specks.map((speck, index) => (
        <motion.div
          key={index}
          className={`absolute ${speck.acid ? 'bg-acid' : 'bg-bone'}`}
          style={{
            left: `${speck.left}%`,
            top: `${speck.top}%`,
            width: speck.size,
            height: speck.size,
          }}
          initial={{ opacity: speck.peak * 0.3, y: 0 }}
          animate={
            still
              ? { opacity: speck.peak * 0.6, y: 0 }
              : {
                  // Flicker and drift run on one period but different shapes,
                  // so the field never pulses in unison.
                  opacity: [speck.peak * 0.15, speck.peak, speck.peak * 0.25],
                  y: [0, -speck.drift, 0],
                }
          }
          transition={
            still
              ? { duration: 0.3 }
              : {
                  duration: speck.duration,
                  delay: speck.delay,
                  repeat: Infinity,
                  ease: EASE_BREATH,
                }
          }
        />
      ))}
    </div>
  );
});
