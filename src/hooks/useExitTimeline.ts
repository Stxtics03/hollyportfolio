import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExitPhase } from '../lib/exitPhase';

export type ExitTiming = {
  /** Beat held on READY before anything moves. */
  holdMs: number;
  /** Contents leaving. */
  emptyMs: number;
  /** Gap between the marquee leaving and the wordmark leaving. */
  contentStaggerMs: number;
  /** Card expanding past the viewport. */
  expandMs: number;
  /** The acid frame at the seam. */
  flashMs: number;
  /** Repeat visit within the session: no choreography, just this fade. */
  fadeMs: number;
};

type UseExitTimelineOptions = {
  /** Start the timeline. */
  isReady: boolean;
  /** Session repeat: skip the choreography, play `fadeMs` instead. */
  isRepeatVisit: boolean;
  timing: ExitTiming;
  /** Reduced motion also takes the plain fade path. */
  reducedMotion?: boolean;
  /** Fired once, when the loader is finished and safe to unmount. */
  onComplete?: () => void;
  /**
   * Fired on every phase change. Built now, unused for the moment — this is
   * the seam a dark→light theme shift would sync to.
   */
  onPhaseChange?: (phase: ExitPhase) => void;
};

/**
 * Drives the exit as a chain of timers rather than one long animation, so any
 * phase's duration can be retuned in isolation and `skip` can cut the whole
 * thing short from anywhere in it.
 */
export function useExitTimeline({
  isReady,
  isRepeatVisit,
  timing,
  reducedMotion = false,
  onComplete,
  onPhaseChange,
}: UseExitTimelineOptions): { phase: ExitPhase; skip: () => void } {
  const [phase, setPhase] = useState<ExitPhase>('idle');
  const timers = useRef<number[]>([]);
  const finished = useRef(false);
  const started = useRef(false);

  // Keep the callbacks current without making them restart the timeline.
  const onCompleteRef = useRef(onComplete);
  const onPhaseChangeRef = useRef(onPhaseChange);
  onCompleteRef.current = onComplete;
  onPhaseChangeRef.current = onPhaseChange;

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setPhase('done');
    onCompleteRef.current?.();
  }, []);

  /** Click or Esc: cut straight to the end, from wherever we are. */
  const skip = useCallback(() => {
    clearTimers();
    finish();
  }, [clearTimers, finish]);

  useEffect(() => {
    // Guarded by a ref, not by `phase`. With `phase` in the dependency array
    // this effect re-runs on its own first `setPhase`, and its cleanup then
    // clears the very timers it just scheduled — the exit freezes on beat one.
    if (!isReady || started.current) return;
    started.current = true;

    const at = (ms: number, next: () => void) => {
      timers.current.push(window.setTimeout(next, ms));
    };

    if (isRepeatVisit || reducedMotion) {
      // No choreography — the piece has already been seen this session, or the
      // viewer asked for less movement.
      setPhase('fade');
      at(timing.fadeMs, finish);
      return;
    }

    setPhase('hold');

    const emptyAt = timing.holdMs;
    const expandAt = emptyAt + timing.emptyMs;
    const flashAt = expandAt + timing.expandMs;
    const doneAt = flashAt + timing.flashMs;

    at(emptyAt, () => setPhase('empty'));
    at(expandAt, () => setPhase('expand'));
    at(flashAt, () => setPhase('flash'));
    at(doneAt, finish);

    // No cleanup here on purpose — the timers are torn down by the unmount
    // effect below, so a re-render can never cancel the timeline mid-flight.
  }, [isReady, isRepeatVisit, reducedMotion, timing, finish, clearTimers]);

  useEffect(() => {
    onPhaseChangeRef.current?.(phase);
  }, [phase]);

  // Skip on click anywhere, or Esc.
  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, skip]);

  useEffect(() => clearTimers, [clearTimers]);

  return { phase, skip };
}
