import { useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
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
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { EASE_REVEAL } from '../../lib/easings';

/** Stable identity so the progress effect doesn't re-run on every render. */
const ALBUM_SOURCES = ALBUMS.map((album) => album.cover);

/**
 * Every tunable in the boot sequence. Nothing below this object hardcodes a
 * duration, an opacity, or a speed — tune the piece from here.
 *
 * STAGES 1–2. Present: background field, pixel specks, grain, card shell.
 * Still to come: album marquee, wordmark, status bar + progress gating, exit
 * transition, responsive/reduced-motion/debug passes.
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
} as const;

type BootSequenceProps = {
  /** Renders the typography specimen instead of the poster (`?type` in the URL). */
  showTypeSpecimen?: boolean;
  /** `?debug=boot` — pins progress to a slider and freezes all motion. */
  debug?: boolean;
};

export function BootSequence({ showTypeSpecimen = false, debug = false }: BootSequenceProps) {
  const reducedMotion = useReducedMotion();
  const [pinnedProgress, setPinnedProgress] = useState(0.42);

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

  // In debug mode the slider is the source of truth, not the real work.
  const view = debug
    ? {
        progress: pinnedProgress,
        percent: Math.round(pinnedProgress * 100),
        phase: phaseFor(pinnedProgress),
      }
    : boot;

  const screen = (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-ink">
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
        <PixelSpecks
          count={BOOT_CONFIG.specks.count}
          seed={BOOT_CONFIG.specks.seed}
          still={frozen}
        />
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
            <BootCard tuning={BOOT_CONFIG.card} still={frozen} staticRender={debug}>
              <div
                className="flex h-full w-full items-stretch gap-6"
                style={{
                  padding: BOOT_CONFIG.card.padding,
                  // Space held for the status bar so stage 4 lands without
                  // shifting anything above it.
                  paddingBottom: BOOT_CONFIG.card.statusBarHeight,
                }}
              >
                <AlbumMarquee
                  albums={ALBUMS}
                  tuning={BOOT_CONFIG.marquee}
                  still={frozen}
                  className="h-full shrink-0"
                  // Square-ish column: the panel takes its share of the card's
                  // width and fills the available height.
                  style={{ width: `${BOOT_CONFIG.card.panelWidthRatio * 100}%` }}
                />

                <div className="flex min-w-0 flex-1 items-center">
                  <Wordmark tuning={BOOT_CONFIG.wordmark} still={frozen} />
                </div>
              </div>
              <StatusBar
                progress={view.progress}
                percent={view.percent}
                phase={view.phase}
                tuning={BOOT_CONFIG.statusBar}
                still={frozen}
              />
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
    </div>
  );

  if (!debug) return screen;

  // `isStatic` renders every motion component at its final animated value with
  // no frame loop at all — the screen becomes inspectable even where rAF is
  // suspended, and the slider stays the only thing that changes.
  return (
    <MotionConfig isStatic>
      {screen}
      <DebugPanel
        progress={view.progress}
        percent={view.percent}
        phase={view.phase}
        onProgressChange={setPinnedProgress}
      />
    </MotionConfig>
  );
}
