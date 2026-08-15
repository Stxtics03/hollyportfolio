import { AnimatePresence, motion } from 'framer-motion';
import type { BootPhase } from '../../hooks/useBootProgress';
import { EASE_ROLL } from '../../lib/easings';

export type StatusBarTuning = {
  /** Height of the bar, px. Must match the space the card reserves for it. */
  height: number;
  /** Number of hatch ticks in the track. ~40 is the brief. */
  tickCount: number;
  /** Degrees of skew on each tick — this is what makes it read as hatching. */
  skew: number;
  /** Seconds for a status label to roll out and the next to roll in. */
  rollSeconds: number;
};

type StatusBarProps = {
  /** 0–1, already eased. */
  progress: number;
  /** 0–100, whole numbers. */
  percent: number;
  phase: BootPhase;
  tuning: StatusBarTuning;
  /** No pulse on the leading tick, no roll on the label. */
  still?: boolean;
};

/**
 * The load gate: hatched track, rolling status label, uneven counter.
 *
 * The track is ~40 skewed ticks rather than a filled rectangle, matching the
 * diagonal-stripe sketch in SS1. Ticks are discrete, so this only re-renders
 * when the whole percent changes — at most a hundred times across the entire
 * boot, not once per frame.
 */
export function StatusBar({ progress, percent, phase, tuning, still = false }: StatusBarProps) {
  const filled = Math.round(progress * tuning.tickCount);

  return (
    <div
      className="absolute inset-x-0 bottom-0 flex items-center gap-5 border-t border-smoke-soft px-6"
      style={{ height: tuning.height }}
    >
      {/* Hatched track */}
      <div className="flex min-w-0 flex-1 items-center gap-[3px]" aria-hidden>
        {Array.from({ length: tuning.tickCount }, (_, index) => {
          const isFilled = index < filled;
          // The tick at the boundary is the one doing the work — it pulses.
          const isLeading = index === filled - 1;

          return (
            <motion.span
              key={index}
              className="h-3 flex-1 rounded-[1px]"
              style={{
                transform: `skewX(${tuning.skew}deg)`,
                backgroundColor: isFilled ? '#C8F542' : 'rgba(255,255,255,0.09)',
              }}
              animate={
                isLeading && !still
                  ? { opacity: [1, 0.35, 1] }
                  : { opacity: isFilled ? 1 : 0.7 }
              }
              transition={
                isLeading && !still
                  ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.2 }
              }
            />
          );
        })}
      </div>

      {/* Status label. Rolls vertically — a crossfade here would read as a
          label changing its mind rather than a machine advancing a state. */}
      <div
        className="relative shrink-0 overflow-hidden text-right"
        style={{ height: 20, width: 132 }}
      >
        <AnimatePresence initial={false}>
          <motion.span
            key={phase}
            className="text-acid tracking-label text-micro absolute inset-0 flex items-center justify-end uppercase"
            initial={still ? { y: 0 } : { y: '110%' }}
            animate={{ y: 0 }}
            exit={still ? { y: 0 } : { y: '-110%' }}
            transition={{ duration: still ? 0 : tuning.rollSeconds, ease: EASE_ROLL }}
          >
            {phase}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Counter. Zero-padded so the width never shifts — Departure Mono is
          monospaced, but a 2→3 digit jump would still nudge the layout. */}
      <span className="text-bone/45 tracking-label text-micro shrink-0 tabular-nums">
        {String(percent).padStart(3, '0')}%
      </span>
    </div>
  );
}
