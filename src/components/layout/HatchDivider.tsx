export type HatchTuning = {
  /** Band height, px. ~24 in SS-D. */
  height: number;
  /** Stripe angle, degrees. */
  angle: number;
  /** Distance between stripes, px. Lower = denser. */
  gap: number;
  /** Stripe width, px. */
  weight: number;
  /** Stripe colour. Low-contrast `smoke` by intent. */
  color: string;
  /** Hairline above and below the band. */
  edgeColor: string;
};

type HatchDividerProps = {
  tuning: HatchTuning;
  className?: string;
};

/**
 * Full-bleed diagonal hatch band, the section divider from SS-D.
 *
 * Runs edge to edge while the content column stays narrow — that contrast is
 * what stops the layout reading as a template. Drawn as a repeating gradient
 * rather than an SVG pattern: one paint, no DOM, and the angle and density
 * stay tunable from `SITE_CONFIG`.
 */
export function HatchDivider({ tuning, className = '' }: HatchDividerProps) {
  return (
    <div
      aria-hidden
      className={`w-full ${className}`}
      style={{
        height: tuning.height,
        borderTop: `1px solid ${tuning.edgeColor}`,
        borderBottom: `1px solid ${tuning.edgeColor}`,
        backgroundImage: `repeating-linear-gradient(${tuning.angle}deg, ${tuning.color} 0px, ${tuning.color} ${tuning.weight}px, transparent ${tuning.weight}px, transparent ${tuning.gap}px)`,
      }}
    />
  );
}
