import { memo } from 'react';

type GrainOverlayProps = {
  /** 0–1. SS2's grain is loud; 0.12–0.3 is the useful window. */
  opacity?: number;
  /** Turbulence frequency. Higher = finer, more halftone-ish. */
  frequency?: number;
  /**
   * `screen` lifts speckle out of a near-black field (use it on the background).
   * `overlay` eats the edges of anything bright — type, the ball's mirrors —
   * but does almost nothing over black. Most surfaces want both, layered.
   */
  blend?: 'screen' | 'overlay' | 'soft-light';
  /** Animate the grain's position so the field shimmers instead of sitting still. */
  animated?: boolean;
  className?: string;
};

/**
 * Film-grain / halftone layer.
 *
 * Implemented as an inline SVG `feTurbulence` rather than a tiling PNG: no
 * network request, resolution independent, and the frequency stays tunable
 * from `BOOT_CONFIG`. The filtered rect is oversized and translated by a CSS
 * keyframe so the noise field drifts — the filter rasterises once, the drift
 * is a composited transform.
 */
export const GrainOverlay = memo(function GrainOverlay({
  opacity = 0.18,
  frequency = 0.85,
  blend = 'overlay',
  animated = true,
  className = '',
}: GrainOverlayProps) {
  // Filter ids must be unique per instance or the first one wins document-wide.
  const filterId = `boot-grain-${frequency.toString().replace('.', '-')}-${blend}`;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity, mixBlendMode: blend }}
    >
      <svg
        className="absolute"
        style={{
          // Oversized so the drift never exposes an edge.
          top: '-20%',
          left: '-20%',
          width: '140%',
          height: '140%',
          animation: animated ? 'grain-shift 7s steps(10) infinite' : undefined,
          willChange: animated ? 'transform' : undefined,
        }}
      >
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={frequency}
            numOctaves={3}
            stitchTiles="stitch"
          />
          {/* Crush to monochrome speckle: kills the rainbow cast raw turbulence
              has, keeps the "printed on rough paper" read. The alpha ramp
              throws away the mid-greys so grain reads as grit, not haze. */}
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="2.2" intercept="-0.55" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </div>
  );
});
