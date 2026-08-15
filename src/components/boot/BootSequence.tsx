import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlbumMarquee } from './AlbumMarquee';
import { BootCard } from './BootCard';
import { DebugPanel } from './DebugPanel';
import { GrainOverlay } from './GrainOverlay';
import { PixelSpecks } from './PixelSpecks';
import { StatusBar } from './StatusBar';
import { TypeSpecimen } from './TypeSpecimen';
import { Wordmark } from './Wordmark';
import { ALBUMS } from '../../data/albums';
import { phaseFor, useBootProgress } from '../../hooks/useBootProgress';
import { useExitTimeline } from '../../hooks/useExitTimeline';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { EASE_LAUNCH, EASE_REVEAL } from '../../lib/easings';
import { isLeaving, type ExitPhase } from '../../lib/exitPhase';

/** Stable identity so the progress effect doesn't re-run on every render. */
const ALBUM_SOURCES = ALBUMS.map((album) => album.cover);

/**
 * Every tunable in the boot sequence. Nothing below this object hardcodes a
 * duration, an opacity, or a speed — tune the piece from here.
 *
 * STAGES 1–5. Present: background field, pixel specks, grain, card shell,
 * album marquee, wordmark, status bar + real progress gating, exit transition
 * and handoff. Still to come: the responsive pass (stage 6).
 *
 * NOTE: the dithered focal mass that used to sit behind the card is gone by
 * request — nothing renders behind the card now but the flat field, its grain
 * and the specks in the margins.
 */
export const BOOT_CONFIG = {
  specks: {
    count: 14,
    seed: 8152026,
  },
  card: {
    width: 'min(1000px, 88vw)',
    /** SS1's proportion. 0.52–0.56 all read correctly; 0.54 is the middle. */
    heightRatio: 0.54,
    maxHeight: '78vh',
    /**
     * The card's edge. Deliberately the same family as the field behind it —
     * a hair lighter than `ink`, no hue of its own — so the card separates by
     * value alone. No acid on this edge.
     */
    edgeColor: '#1C1C1C',
    /** One lap of the border. Long enough that you catch it, not watch it. */
    sheenSeconds: 9,
    /** One inhale + exhale of the halo. */
    breathSeconds: 6.5,
    /**
     * Neutral halo behind the card, off by default. The acid version tinted
     * the frame and put color on the edge; this one is plain bone if you ever
     * want the card seated more softly. 0 = nothing renders behind the card.
     */
    haloAlpha: 0,
    /** Dithers the fill gradient. Third grain budget, still nowhere near type. */
    surfaceGrain: 0.055,
    entranceDuration: 0.95,
    entranceDelay: 0.25,
    /** Kept in sync with `exit.expandMs` / `exit.fadeMs`. */
    expandSeconds: 0.62,
    fadeSeconds: 0.4,
    /** Inner padding, px. */
    padding: 26,
    /** Reserved for the status bar (stage 4) so nothing shifts when it lands. */
    statusBarHeight: 58,
    /** Left panel's share of the card's width. */
    panelWidthRatio: 0.38,
  },
  marquee: {
    /** Seconds for one cover to cross the panel. */
    secondsPerCover: 2.5,
    gap: 14,
    /** Centre cover plus a slice of its neighbours. */
    coverHeightRatio: 0.62,
    neighbourScale: 0.9,
    neighbourOpacity: 0.45,
    neighbourSaturation: 0.55,
  },
  progress: {
    /** Floor on how long the screen stays up, even on a warm cache. */
    minDisplayMs: 2400,
    /** The bar can't pass this until every real task has resolved. */
    cap: 0.92,
    /** Fixed seed keeps the stall/jump pattern reproducible while tuning. */
    seed: 4242,
  },
  statusBar: {
    /** Kept in sync with `card.statusBarHeight`. */
    height: 58,
    tickCount: 40,
    /** Skew is what makes the track read as hatching rather than a bar. */
    skew: -18,
    rollSeconds: 0.32,
  },
  wordmark: {
    revealDuration: 0.85,
    lineStagger: 0.09,
    /** One glitch pass on `.EXE`, this long after mount. */
    glitchDelay: 1.2,
    glitchDuration: 0.12,
  },
  grain: {
    /**
     * TWO separate grain layers, and they must stay separate.
     *
     * Grain and pixel type are noise at the same scale — stack them and both
     * turn to mush. The background carries the texture; the type layer gets
     * almost none.
     */
    background: {
      /**
       * `screen` lifts speckle out of black; `overlay` can't see black at all.
       * Keep this low — screen raises the floor, and past ~0.12 the deep
       * near-black turns to flat grey and the paper stops feeling like paper.
       */
      lift: 0.1,
      /** `overlay` chews the edges of whatever is bright down there. */
      bite: 0.16,
      frequency: 0.82,
    },
    type: {
      /** Near zero by design. Raise past ~0.06 and the glyphs start to crumble. */
      opacity: 0.03,
      frequency: 0.9,
    },
  },
  vignette: {
    /**
     * Marginally lighter behind the card, falling off to the corners. This is
     * the soft glow under the dither mass — raise it and the centre starts to
     * read as a separate blob rather than a lit patch of the same paper.
     */
    centerLift: 'rgba(255,255,255,0.028)',
    edge: 'rgba(0,0,0,0.72)',
  },
  entrance: {
    fieldDuration: 0.9,
  },
  /**
   * The exit. ~1.2s end to end, and every number here is independent — the
   * timeline is a chain of timers, not one long animation, so any beat can be
   * retuned without recalculating the others.
   */
  exit: {
    /** READY lands, then one beat of nothing. */
    holdMs: 250,
    /** Contents leave. The card must look empty before it moves. */
    emptyMs: 260,
    /** Marquee first, wordmark after. */
    contentStaggerMs: 60,
    /** Card expands past the viewport. */
    expandMs: 620,
    /** A single acid frame at the seam. */
    flashMs: 90,
    /** Repeat visit within the session: no choreography, just this. */
    fadeMs: 400,
  },
} as const;

type BootSequenceProps = {
  /** Renders the typography specimen instead of the poster (`?type` in the URL). */
  showTypeSpecimen?: boolean;
  /** `?debug=boot` — pins progress to a slider and the exit to buttons. */
  debug?: boolean;
  /** `?exit=<phase>` — the exit phase to start pinned at, for inspecting one beat. */
  initialExitPhase?: ExitPhase;
  /** Fired once the loader is finished and safe to unmount. */
  onComplete?: () => void;
  /**
   * Fired on every exit phase change. Wired now, unused for the moment — this
   * is the seam a dark→light theme shift would sync to.
   */
  onPhaseChange?: (phase: ExitPhase) => void;
};

export function BootSequence({
  showTypeSpecimen = false,
  debug = false,
  initialExitPhase = 'idle',
  onComplete,
  onPhaseChange,
}: BootSequenceProps) {
  const reducedMotion = useReducedMotion();
  const [pinnedProgress, setPinnedProgress] = useState(0.42);
  const [pinnedExitPhase, setPinnedExitPhase] = useState<ExitPhase>(initialExitPhase);

  const boot = useBootProgress({
    assets: ALBUM_SOURCES,
    minDisplayMs: BOOT_CONFIG.progress.minDisplayMs,
    cap: BOOT_CONFIG.progress.cap,
    seed: BOOT_CONFIG.progress.seed,
    instant: reducedMotion || debug,
    // STAGE 5: pass the main app's readiness promise in here.
  });

  /** Debug mode has no frame loop to run animations with; so does reduced motion. */
  const frozen = reducedMotion || debug;

  const { phase: timelinePhase, skip } = useExitTimeline({
    // Debug pins progress by hand; the exit must not fire off the slider.
    isReady: debug ? false : boot.isReady,
    isRepeatVisit: boot.isRepeatVisit,
    timing: BOOT_CONFIG.exit,
    reducedMotion,
    onComplete,
    onPhaseChange,
  });

  // Debug scrubs the exit by hand; otherwise the timeline owns it.
  const exitPhase = debug ? pinnedExitPhase : timelinePhase;
  const leaving = isLeaving(exitPhase);

  // In debug mode the slider is the source of truth, not the real work.
  const view = debug
    ? {
        progress: pinnedProgress,
        percent: Math.round(pinnedProgress * 100),
        phase: phaseFor(pinnedProgress),
      }
    : boot;

  const screen = (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-ink"
      // Skippable from anywhere in the transition, per the brief. Esc is
      // handled inside the timeline hook.
      onClick={exitPhase === 'idle' ? undefined : skip}
    >
      {/* Base field: near-black with a slight radial lift behind the card. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 47%, ${BOOT_CONFIG.vignette.centerLift} 0%, transparent 62%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, ${BOOT_CONFIG.vignette.edge} 100%), #0A0A0A`,
        }}
      />

      <motion.div
        className="absolute inset-0"
        initial={debug ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: BOOT_CONFIG.entrance.fieldDuration, ease: EASE_REVEAL }}
      >
        <motion.div
          className="absolute inset-0"
          initial={debug ? false : undefined}
          animate={{ opacity: leaving ? 0 : 1 }}
          transition={{ duration: 0.3, ease: EASE_REVEAL }}
        >
          <PixelSpecks
            count={BOOT_CONFIG.specks.count}
            seed={BOOT_CONFIG.specks.seed}
            still={frozen}
          />
        </motion.div>
      </motion.div>

      {/* Background grain: two passes. `screen` puts grit into the black field,
          `overlay` chews the edges of anything bright in it. One pass alone
          always loses half the surface. Neither touches the type layer. */}
      <GrainOverlay
        opacity={BOOT_CONFIG.grain.background.lift}
        frequency={BOOT_CONFIG.grain.background.frequency}
        blend="screen"
        animated={!reducedMotion}
      />
      <GrainOverlay
        opacity={BOOT_CONFIG.grain.background.bite}
        frequency={BOOT_CONFIG.grain.background.frequency}
        blend="overlay"
        animated={!reducedMotion}
      />

      {/* ── Everything above this line is background. Everything below is type. ── */}
      <div className="absolute inset-0 z-10">
        {showTypeSpecimen ? (
          <div className="h-full overflow-y-auto">
            <TypeSpecimen />
          </div>
        ) : (
          <div className="grid h-full w-full place-items-center">
            <BootCard
              tuning={BOOT_CONFIG.card}
              still={frozen}
              staticRender={debug}
              exitPhase={exitPhase}
            >
              <div
                className="flex h-full w-full items-stretch gap-6"
                style={{
                  padding: BOOT_CONFIG.card.padding,
                  // Space held for the status bar so it lands without shifting
                  // anything above it.
                  paddingBottom: BOOT_CONFIG.card.statusBarHeight,
                }}
              >
                {/* Contents leave before the card moves, on a fast stagger —
                    the card has to look empty by the time it expands, or the
                    expansion drags a shrinking screenshot of its own contents
                    across the viewport. */}
                <motion.div
                  className="h-full shrink-0"
                  style={{ width: `${BOOT_CONFIG.card.panelWidthRatio * 100}%` }}
                  initial={debug ? false : undefined}
                  animate={{ opacity: leaving ? 0 : 1, y: leaving ? -18 : 0 }}
                  transition={{
                    duration: BOOT_CONFIG.exit.emptyMs / 1000,
                    ease: EASE_LAUNCH,
                  }}
                >
                  <AlbumMarquee
                    albums={ALBUMS}
                    tuning={BOOT_CONFIG.marquee}
                    still={frozen}
                    className="h-full w-full"
                  />
                </motion.div>

                <motion.div
                  className="flex min-w-0 flex-1 items-center"
                  initial={debug ? false : undefined}
                  animate={{ opacity: leaving ? 0 : 1, y: leaving ? -18 : 0 }}
                  transition={{
                    duration: BOOT_CONFIG.exit.emptyMs / 1000,
                    delay: leaving ? BOOT_CONFIG.exit.contentStaggerMs / 1000 : 0,
                    ease: EASE_LAUNCH,
                  }}
                >
                  <Wordmark tuning={BOOT_CONFIG.wordmark} still={frozen} />
                </motion.div>
              </div>
              {/* The bar leaves last: it's the thing that said READY, so it
                  holds a beat longer than the panels above it. */}
              <motion.div
                initial={debug ? false : undefined}
                animate={{ opacity: leaving ? 0 : 1 }}
                transition={{
                  duration: BOOT_CONFIG.exit.emptyMs / 1000,
                  delay: leaving ? (BOOT_CONFIG.exit.contentStaggerMs * 2) / 1000 : 0,
                  ease: EASE_LAUNCH,
                }}
              >
                <StatusBar
                  progress={view.progress}
                  percent={view.percent}
                  phase={view.phase}
                  tuning={BOOT_CONFIG.statusBar}
                  still={frozen}
                />
              </motion.div>
            </BootCard>
          </div>
        )}

        {/* The type layer's own grain, at a fraction of the background's. */}
        <GrainOverlay
          opacity={BOOT_CONFIG.grain.type.opacity}
          frequency={BOOT_CONFIG.grain.type.frequency}
          blend="overlay"
          animated={!reducedMotion}
        />
      </div>

      {/* Ink curtain: wipes across while the card expands, so the handoff is a
          surface passing over the screen rather than a shape growing on it. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 bg-ink"
        initial={debug ? false : { x: '-100%' }}
        animate={{ x: exitPhase === 'expand' || exitPhase === 'flash' ? '0%' : '-100%' }}
        transition={{ duration: BOOT_CONFIG.exit.expandMs / 1000, ease: EASE_LAUNCH }}
      />

      {/* One acid frame at the seam. Long enough to register, short enough to
          doubt — it reads as the screen switching on, not as a colour wash. */}
      <motion.div
        aria-hidden
        className="bg-acid pointer-events-none absolute inset-0 z-30"
        initial={debug ? false : { opacity: 0 }}
        animate={{ opacity: exitPhase === 'flash' ? 0.92 : 0 }}
        transition={{ duration: BOOT_CONFIG.exit.flashMs / 1000, ease: 'linear' }}
      />
    </div>
  );

  if (!debug) return screen;

  // Deliberately NOT wrapped in `MotionConfig isStatic`: that renders each
  // motion component once and then ignores prop changes, so the scrub buttons
  // would select a phase without anything moving. Debug plays the real
  // transitions; `?exit=<phase>` is there for pinning a single beat statically
  // on load instead.
  return (
    <>
      {screen}
      <DebugPanel
        progress={view.progress}
        percent={view.percent}
        phase={view.phase}
        exitPhase={exitPhase}
        onProgressChange={setPinnedProgress}
        onExitPhaseChange={setPinnedExitPhase}
      />
    </>
  );
}
