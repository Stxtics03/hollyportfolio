import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE_REVEAL } from '../../lib/easings';

export type WordmarkTuning = {
  /** Seconds each line takes to clear its mask. */
  revealDuration: number;
  /** Seconds between line 1 and line 2. */
  lineStagger: number;
  /** Seconds after mount before the single glitch pass. */
  glitchDelay: number;
  /** Seconds the glitch lasts. Short enough to doubt you saw it. */
  glitchDuration: number;
};

type WordmarkProps = {
  tuning: WordmarkTuning;
  /** No reveal, no glitch — just the type. */
  still?: boolean;
};

/**
 * A line that clears a mask from below.
 *
 * The mask is an `overflow-hidden` wrapper sized to the line box; the inner
 * span starts fully below it and translates up to 0. That reads as type being
 * uncovered rather than type sliding in, which is the difference between this
 * and a stock slide-up.
 */
function MaskedLine({
  children,
  delay,
  duration,
  still,
  className = '',
}: {
  children: React.ReactNode;
  delay: number;
  duration: number;
  still: boolean;
  className?: string;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className={`block ${className}`}
        initial={still ? { y: '0%' } : { y: '110%' }}
        animate={{ y: '0%' }}
        transition={still ? { duration: 0 } : { duration, delay, ease: EASE_REVEAL }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Wordmark({ tuning, still = false }: WordmarkProps) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (still) return;
    // Once. Not a loop, not a hover state — one pass and it never returns.
    const start = window.setTimeout(() => {
      setGlitching(true);
      window.setTimeout(() => setGlitching(false), tuning.glitchDuration * 1000);
    }, tuning.glitchDelay * 1000);
    return () => window.clearTimeout(start);
  }, [still, tuning.glitchDelay, tuning.glitchDuration]);

  return (
    <div className="flex flex-col gap-2">
      <MaskedLine
        delay={0}
        duration={tuning.revealDuration}
        still={still}
        className="text-bone/75 tracking-label text-micro uppercase md:text-body lg:text-lead"
      >
        Welcome to
      </MaskedLine>

      <MaskedLine
        delay={tuning.lineStagger}
        duration={tuning.revealDuration}
        still={still}
        className="text-acid pixel-bold tracking-heading text-sub leading-display md:text-display-sm lg:text-display"
      >
        <span className="relative inline-block">
          {/* Split so the glitch can hit `.EXE` alone. */}
          SHRESTHA
          <span className="relative inline-block">
            .EXE
            {/* Offset copies, in palette — an acid/bone split rather than the
                usual red/cyan, which would drag two foreign hues into a
                two-colour composition for 120ms. */}
            {glitching ? (
              <>
                <span
                  aria-hidden
                  className="text-bone absolute inset-0 -translate-x-[2px] translate-y-[1px] opacity-80"
                >
                  .EXE
                </span>
                <span
                  aria-hidden
                  className="text-acid-deep absolute inset-0 translate-x-[2px] -translate-y-[1px] opacity-70"
                >
                  .EXE
                </span>
              </>
            ) : null}
          </span>
        </span>
      </MaskedLine>
    </div>
  );
}
