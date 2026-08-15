import { useEffect, useRef, useState } from 'react';
import { createRng } from '../lib/rng';

/** Phase thresholds, as fractions of visible progress. */
export const BOOT_PHASES = [
  { at: 0, label: 'INITIALIZING' },
  { at: 0.25, label: 'PREPARING' },
  { at: 0.55, label: 'SETTING UP' },
  { at: 0.85, label: 'ALMOST THERE' },
  { at: 1, label: 'READY' },
] as const;

export type BootPhase = (typeof BOOT_PHASES)[number]['label'];

const SESSION_KEY = 'shrestha-exe:booted';

export type BootProgressOptions = {
  /** Image URLs to preload. Real bytes — this is what the bar is measuring. */
  assets: readonly string[];
  /** Floor on how long the screen stays up, so fast connections still see it. */
  minDisplayMs: number;
  /** The bar can't pass this until every task has actually resolved. */
  cap: number;
  /** Resolve when the main app is mounted and ready. Optional for now. */
  appReady?: Promise<unknown>;
  /** Skip the easing entirely (reduced motion, or a repeat visit). */
  instant?: boolean;
  /** Fixed seed keeps the stall pattern reproducible while tuning. */
  seed?: number;
};

export type BootProgressState = {
  /** Eased, visible progress, 0–1. */
  progress: number;
  /** `progress` as a whole number, 0–100. */
  percent: number;
  phase: BootPhase;
  /** Everything resolved, minimum time served, bar landed on 100. */
  isReady: boolean;
  /** This session already played the full sequence once. */
  isRepeatVisit: boolean;
};

export function phaseFor(progress: number): BootPhase {
  let label: BootPhase = BOOT_PHASES[0].label;
  for (const phase of BOOT_PHASES) {
    if (progress >= phase.at) label = phase.label;
  }
  // Only ever say READY at a true 100.
  if (progress < 1 && label === 'READY') return 'ALMOST THERE';
  return label;
}

/**
 * Boot progress driven by real work.
 *
 * The bar measures actual tasks — `document.fonts.ready`, every album cover
 * decoding, and (later) a promise for main-app readiness. A fake timer would
 * be free, and would also lie: it would hit 100% while the covers were still
 * blank. What *is* synthetic is the shape of the motion between those events:
 * the visible value chases the real one through a damped spring, with
 * scheduled stalls and speed changes, because a perfectly linear bar reads as
 * a progress-shaped decoration rather than a loader.
 *
 * Two gates sit in front of 100%: every task must resolve, and `minDisplayMs`
 * must have elapsed. Until both, the value is capped.
 */
export function useBootProgress({
  assets,
  minDisplayMs,
  cap,
  appReady,
  instant = false,
  seed = 4242,
}: BootProgressOptions): BootProgressState {
  const [isRepeatVisit] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      // Private mode / storage disabled: treat every visit as the first.
      return false;
    }
  });

  const [state, setState] = useState<Omit<BootProgressState, 'isRepeatVisit'>>({
    progress: 0,
    percent: 0,
    phase: 'INITIALIZING',
    isReady: false,
  });

  // Live counters the frame loop reads. Refs, not state — the loop must not
  // depend on React having re-rendered.
  const settled = useRef(0);
  const total = useRef(1);
  const minElapsed = useRef(false);

  useEffect(() => {
    const skipChoreography = instant || isRepeatVisit;

    let cancelled = false;
    const markSettled = () => {
      if (!cancelled) settled.current += 1;
    };

    // ---- The real work -------------------------------------------------
    const tasks: Promise<unknown>[] = [];

    tasks.push(document.fonts.ready);

    for (const src of assets) {
      tasks.push(
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => resolve();
          // A broken cover must not wedge the loader forever.
          image.onerror = () => resolve();
          image.src = src;
        }),
      );
    }

    if (appReady) tasks.push(Promise.resolve(appReady));

    total.current = tasks.length;
    settled.current = 0;
    for (const task of tasks) task.then(markSettled, markSettled);

    // ---- The minimum-display gate ---------------------------------------
    minElapsed.current = false;
    const minTimer = window.setTimeout(
      () => {
        minElapsed.current = true;
      },
      skipChoreography ? 0 : minDisplayMs,
    );

    // ---- The visible value ----------------------------------------------
    const rng = createRng(seed);
    let value = 0;
    let lastFrame = performance.now();
    let stallUntil = 0;
    let speed = 1;
    let frame = 0;
    let lastPercent = -1;

    const commit = (next: number, done: boolean) => {
      const percent = Math.round(next * 100);
      if (percent === lastPercent && !done) return;
      lastPercent = percent;
      setState({
        progress: next,
        percent,
        phase: phaseFor(next),
        isReady: done,
      });
    };

    const tick = (now: number) => {
      const delta = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;

      const allSettled = settled.current >= total.current;
      const released = allSettled && minElapsed.current;
      const target = released ? 1 : Math.min(settled.current / total.current, cap);

      if (now >= stallUntil) {
        // Critically damped chase — frame-rate independent, never snaps.
        value += (target - value) * (1 - Math.exp(-2.8 * speed * delta));

        // Real loaders stall and jump. Only below the cap: stalling at 99%
        // is the thing everyone hates about real loaders.
        if (value < 0.85 && rng() < 0.02) {
          stallUntil = now + 100 + rng() * 340;
          speed = 0.55 + rng() * 1.9;
        }
      }

      const done = released && value > 0.999;
      if (done) value = 1;

      commit(value, done);
      if (!done) frame = requestAnimationFrame(tick);
    };

    if (skipChoreography) {
      // Repeat visit or reduced motion: no easing, no stalls. Still waits for
      // the tasks, so the covers are never blank when the screen leaves.
      Promise.all(tasks).then(() => {
        if (!cancelled) commit(1, true);
      });
    } else {
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(minTimer);
    };
  }, [assets, minDisplayMs, cap, appReady, instant, isRepeatVisit, seed]);

  // Remember the visit only once the sequence has actually completed.
  useEffect(() => {
    if (!state.isReady) return;
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Nothing to do — the sequence simply replays next time.
    }
  }, [state.isReady]);

  return { ...state, isRepeatVisit };
}
