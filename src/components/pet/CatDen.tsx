/**
 * The cat's den.
 *
 * A fixed pixel box in the top-left margin that the cursor cat starts in and
 * walks back to whenever you leave the pointer alone. Without it the cat
 * simply froze wherever it happened to stop, which read as a bug rather than
 * as an animal; with it, going still has somewhere to happen.
 *
 * Geometry is exported rather than kept in the markup because `OnekoCat` has
 * to know where home is. One source of truth, so the cat cannot end up
 * sleeping beside its own house.
 */

/**
 * Box geometry, in CSS pixels from the top-left of the viewport.
 *
 * Sized and placed to sit *in* the header row rather than under it: the bar is
 * `h-14` (56px) with its contents centred, so a 36px box at `top: 10` shares a
 * centre line with the wordmark and the nav. The den then reads as part of the
 * page's top rail instead of as something floating in the margin below it.
 */
export const DEN = {
  left: 28,
  top: 10,
  width: 44,
  height: 36,
} as const;

/**
 * Below this the page has no left margin to spare — the column fills the
 * screen and a den would sit on top of the copy. Matches Tailwind's `lg`.
 */
export const DEN_MIN_WIDTH = 1024;

/** True when there is room to draw the den at all. */
export function denVisible(): boolean {
  return typeof window !== 'undefined' && window.innerWidth >= DEN_MIN_WIDTH;
}

/**
 * Where the cat sits when it is home: the mouth of the door, a little above
 * the floor of the box, so the sprite reads as sitting *in* the den rather
 * than balanced on top of it.
 */
export function denHome(): { x: number; y: number } {
  return {
    x: DEN.left + DEN.width / 2,
    y: DEN.top + DEN.height - 13,
  };
}

export function CatDen() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed hidden select-none lg:block"
      style={{
        left: DEN.left,
        top: DEN.top,
        width: DEN.width,
        height: DEN.height,
        // The header's own layer. It renders after the header in `App`, so it
        // still paints on top of the bar rather than behind its backdrop —
        // same plane as the wordmark and the nav, which is what keeps the top
        // rail reading as one row instead of three stacked things.
        zIndex: 40,
      }}
    >
      {/* Drawn on a 26×22 grid at 2px a cell and rendered with hard edges, so
          it sits on the same pixel lattice as the sprite that lives in it. */}
      <svg
        viewBox="0 0 26 22"
        width={DEN.width}
        height={DEN.height}
        shapeRendering="crispEdges"
        fill="none"
      >
        {/* Roof: one cell proud of the walls on each side, which is what makes
            a plain box read as a shelter. */}
        <rect x="0" y="3" width="26" height="2" fill="rgb(var(--color-bone) / 0.16)" />

        {/* Walls and floor. */}
        <rect
          x="2"
          y="5"
          width="22"
          height="16"
          fill="rgb(var(--color-ink-soft))"
          stroke="rgb(var(--color-bone) / 0.13)"
          strokeWidth="1"
        />

        {/* The doorway — an arch, cut as three stacked runs rather than a
            curve, because a real arc would anti-alias into mush at this size. */}
        <rect x="10" y="8" width="6" height="2" fill="rgb(var(--color-ink))" />
        <rect x="9" y="10" width="8" height="11" fill="rgb(var(--color-ink))" />

        {/* A single lit pixel over the door. The only colour on the object, and
            the same accent the section markers use. */}
        <rect x="12" y="6" width="2" height="1" fill="rgb(var(--color-acid))" />

        {/* Ground line, wider than the den, fading the box into the page. */}
        <rect x="1" y="21" width="24" height="1" fill="rgb(var(--color-bone) / 0.09)" />
      </svg>
    </div>
  );
}
