export type ScaleTuning = {
  /** Band height, px. */
  height: number;
  /** Distance between minor ticks, px. */
  tick: number;
  /** Every Nth tick is drawn full height. */
  majorEvery: number;
  /** Minor and major tick heights, px. */
  minorHeight: number;
  majorHeight: number;
  /** Tick width, px. Keep at 1 — this is a bitmap site. */
  weight: number;
  /** Tick colour. Low-contrast by intent: the band is a rule, not an element. */
  color: string;
  /** The brighter major ticks. */
  majorColor: string;
  /** The hairline the ticks are measured against. */
  railColor: string;
  /** Seconds for the scale to travel one full period. Higher = slower. */
  driftSeconds: number;
  /** Seconds between one accent pulse crossing the band and the next. */
  glintSeconds: number;
};

type ScaleDividerProps = {
  tuning: ScaleTuning;
  /**
   * Which way the scale crawls. The two bands on the page are set opposite so
   * they read as one mechanism turning rather than as the same asset twice.
   */
  flow?: 'left' | 'right';
  /** Offsets this band's pulse so the two never fire together. */
  delay?: number;
  className?: string;
};

/**
 * Full-bleed section divider: a measurement scale.
 *
 * Replaces the diagonal hatch band. Ticks against a rail say the same
 * structural thing a rule does — "one part of the page ends here" — but they
 * belong to this site rather than to every template that ships a striped
 * divider, and they give the accent pulse a track to travel along instead of
 * a texture to slide over.
 *
 * Everything is drawn with two repeating gradients on one element: no SVG, no
 * DOM per tick, and the density stays tunable from `SITE_CONFIG`. The whole
 * band is three boxes regardless of how wide the viewport gets.
 */
export function ScaleDivider({
  tuning,
  flow = 'right',
  delay = 0,
  className = '',
}: ScaleDividerProps) {
  /**
   * One period of the pattern. The majors land every `majorEvery` minors, so
   * travelling exactly that far puts every tick back on top of an identical
   * one and the loop is seamless — this is the number the drift animation is
   * built on, not the minor spacing.
   */
  const period = tuning.tick * tuning.majorEvery;

  /** A row of ticks: `weight` px of colour, then a gap, repeating. */
  const ticks = (color: string, every: number) =>
    `repeating-linear-gradient(90deg, ${color} 0px, ${color} ${tuning.weight}px, transparent ${tuning.weight}px, transparent ${every}px)`;

  return (
    <div
      aria-hidden
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: tuning.height }}
    >
      {/* The rail the ticks are measured against. Sits still while the scale
          moves over it, which is what sells the movement as travel. */}
      <span
        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
        style={{ background: tuning.railColor }}
      />

      {/* The scale itself. Both gradients ride one element so they can never
          drift out of step with each other. Overhangs by a period on both
          sides, so the travel never exposes an unpainted edge. */}
      <div
        className="absolute inset-y-0"
        style={{
          left: -period,
          right: -period,
          backgroundImage: `${ticks(tuning.majorColor, period)}, ${ticks(tuning.color, tuning.tick)}`,
          backgroundSize: `100% ${tuning.majorHeight}px, 100% ${tuning.minorHeight}px`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          ['--scale-period' as string]: `${flow === 'right' ? period : -period}px`,
          animation: `scale-drift ${tuning.driftSeconds}s linear infinite`,
        }}
      />

      {/* The pulse: the same scale in the accent, faded out at its own edges so
          it reads as light travelling the rail rather than as a coloured block
          sliding over it. Its width is a quarter of the page, which is what
          makes the -100% → 400% travel cross exactly once. */}
      <div
        className="absolute inset-y-0 left-0 w-1/4"
        style={{
          backgroundImage: `${ticks('rgb(var(--color-acid))', period)}, ${ticks('rgb(var(--color-acid) / 0.7)', tuning.tick)}`,
          backgroundSize: `100% ${tuning.majorHeight}px, 100% ${tuning.minorHeight}px`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          WebkitMaskImage:
            'linear-gradient(90deg, transparent 0%, #000 35%, #000 65%, transparent 100%)',
          maskImage: 'linear-gradient(90deg, transparent 0%, #000 35%, #000 65%, transparent 100%)',
          animation: `scale-glint ${tuning.glintSeconds}s linear ${delay}s infinite`,
          opacity: 0,
        }}
      />
    </div>
  );
}
