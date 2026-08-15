/**
 * The exit transition's state machine.
 *
 * Lives in its own module so `BootCard` can type its props against it without
 * importing from `BootSequence`, which imports `BootCard` right back.
 *
 *   idle   — loading; nothing has fired yet
 *   hold   — the bar has landed on READY and is holding one beat
 *   empty  — the card's contents leave, on a fast stagger
 *   expand — the card scales past the viewport, radius relaxing to 0
 *   flash  — a single acid frame at the seam
 *   done   — the loader is finished; `onComplete` has fired
 *   fade   — repeat visit within the session: a plain 400ms fade, no choreography
 */
export const EXIT_PHASES = [
  'idle',
  'hold',
  'empty',
  'expand',
  'flash',
  'done',
  'fade',
] as const;

export type ExitPhase = (typeof EXIT_PHASES)[number];

/** Narrow an untrusted string (a query param) to a phase. */
export function toExitPhase(value: string | null): ExitPhase {
  return EXIT_PHASES.includes(value as ExitPhase) ? (value as ExitPhase) : 'idle';
}

/** True once the card has started leaving — used to gate content exits. */
export function isLeaving(phase: ExitPhase): boolean {
  return phase === 'empty' || phase === 'expand' || phase === 'flash' || phase === 'done';
}
