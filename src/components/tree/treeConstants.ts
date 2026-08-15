/**
 * Heatmap tree — shared constants.
 *
 * Ported from Lakshya Kumar's portfolio (github.com/27lakshay/lakshyakumar)
 * with the author's permission. Adapted from Next.js to this Vite project;
 * the mechanics and tuning are theirs.
 */

/** Grid pitch: the spacing between cell centres, in CSS px. */
export const CELL_SIZE = 8;
/**
 * Size of the square actually painted inside each cell. Smaller than the cell
 * on purpose — the 2px gutter between squares is what gives the tree its
 * contribution-graph look instead of reading as solid pixel-art shapes.
 */
export const SQUARE_SIZE = 6;
/** How long the tree takes to grow from trunk to tips, in ms. */
export const GROWTH_MS = 2200;
/** Easing factor for the cursor lean. Lower is heavier. */
export const SWAY_EASE = 0.08;

export type TreeAnchor = 'center' | 'bottom-right';
