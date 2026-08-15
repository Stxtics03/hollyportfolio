/**
 * Named easings. Nothing in this project inlines a magic cubic-bezier —
 * import from here so the choreography stays tunable in one place.
 */

export type Cubic = readonly [number, number, number, number];

/** Slow start, hard finish. Mask reveals, type entrances. */
export const EASE_REVEAL: Cubic = [0.16, 1, 0.3, 1];

/** Quiet, symmetric. Breathing glows, idle drifts. */
export const EASE_BREATH: Cubic = [0.45, 0, 0.55, 1];

/** Snaps out of rest, decelerates long. Status text rolls. */
export const EASE_ROLL: Cubic = [0.22, 1, 0.36, 1];

/** Slight anticipation then overshoot. Arc draw settle. */
export const EASE_SETTLE: Cubic = [0.34, 1.56, 0.64, 1];

/** Accelerates away and never comes back. Blast-off. */
export const EASE_LAUNCH: Cubic = [0.7, 0, 0.84, 0];

/** Linear, for continuous rotation only. */
export const EASE_LINEAR: Cubic = [0, 0, 1, 1];
