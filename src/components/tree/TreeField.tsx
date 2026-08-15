import { useCallback, useEffect, useRef, useState } from 'react';
import HeatmapTree, { type SwayMode } from './HeatmapTree';
import PondGrid, { type PondGridHandle, type PondMouse } from './PondGrid';
import type { TreeAnchor } from './treeConstants';

export type TreeFieldTuning = {
  anchor: TreeAnchor;
  fillFactor: number;
  mode: SwayMode;
  /** Extra brightness at the cursor, in `illumination` mode. */
  illumBoost: number;
  /** How much the rest dims while hovering, in `illumination` mode. */
  illumDim: number;
  /** Overall opacity of the whole field. */
  opacity: number;
  /**
   * How far the field extends above its section, in px. Without this the
   * grid's top edge lands wherever the section happens to start — a hard
   * horizontal seam sitting right next to the section label. Bleeding it up
   * past the divider above puts that edge out of sight.
   */
  topBleed: number;
  /**
   * Height of the gradient fade at the field's top edge. A grid that simply
   * stops leaves a hard horizontal line across the page; fading it out over a
   * few rows reads as the field dissolving instead.
   */
  topFade: number;
};

type TreeFieldProps = {
  tuning: TreeFieldTuning;
  className?: string;
};

/**
 * The tree and its grid, composed.
 *
 * Both canvases are driven by a single pointer position tracked here, which is
 * what `HeatmapTree`'s `composed` mode exists for. That matters for more than
 * tidiness: the field sits *behind* the page's content column, so if each
 * canvas listened for its own pointer events it would only ever see the cursor
 * in the margins — move over the text and the tree would stop responding.
 * Tracking at this wrapper instead means the whole section is live, and the
 * canvases can stay `pointer-events: none` and never swallow a click.
 *
 * The pointer is tracked in the wrapper's own coordinate space, so the sticky
 * viewport-sized canvases inside get positions that line up with what's drawn.
 */
export function TreeField({ tuning, className = '' }: TreeFieldProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pondRef = useRef<PondGridHandle>(null);
  const [mouse, setMouse] = useState<PondMouse>({ x: 0, y: 0, active: false });

  const toLocal = useCallback((clientX: number, clientY: number) => {
    const surface = wrapRef.current?.firstElementChild as HTMLElement | undefined;
    const rect = (surface ?? wrapRef.current)?.getBoundingClientRect();
    if (!rect) return null;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const local = toLocal(event.clientX, event.clientY);
      const wrap = wrapRef.current;
      if (!local || !wrap) return;

      // Only live while the section is actually under the cursor.
      const bounds = wrap.getBoundingClientRect();
      const inside =
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom &&
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right;

      setMouse({ x: local.x, y: local.y, active: inside });
    };

    const onLeave = () => setMouse((current) => ({ ...current, active: false }));

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [toLocal]);

  // Clicks anywhere over the section drop a ripple into the grid.
  useEffect(() => {
    const onClick = (event: PointerEvent) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const bounds = wrap.getBoundingClientRect();
      if (event.clientY < bounds.top || event.clientY > bounds.bottom) return;

      const local = toLocal(event.clientX, event.clientY);
      if (local) pondRef.current?.addRipple(local.x, local.y);
    };

    window.addEventListener('pointerdown', onClick, { passive: true });
    return () => window.removeEventListener('pointerdown', onClick);
  }, [toLocal]);

  return (
    <div
      ref={wrapRef}
      className={`absolute inset-x-0 bottom-0 ${className}`}
      style={{ top: -tuning.topBleed }}
      aria-hidden
    >
      <div
        className="pointer-events-none sticky top-0 h-[100dvh] w-full"
        style={{
          opacity: tuning.opacity,
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0px, #000 ${tuning.topFade}px)`,
          maskImage: `linear-gradient(to bottom, transparent 0px, #000 ${tuning.topFade}px)`,
        }}
      >
        {/* Grid first, tree over it — both transparent, both driven by the
            same pointer. */}
        <PondGrid ref={pondRef} anchor={tuning.anchor} mouse={mouse} />

        <div className="absolute inset-0">
          <HeatmapTree
            anchor={tuning.anchor}
            fillFactor={tuning.fillFactor}
            mode={tuning.mode}
            illumBoost={tuning.illumBoost}
            illumDim={tuning.illumDim}
            showGrid={false}
            transparent
            composed
            externalMouse={mouse}
            ariaLabel="Decorative pixel tree"
          />
        </div>
      </div>
    </div>
  );
}
