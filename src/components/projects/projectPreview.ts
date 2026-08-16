import { bayerThreshold } from '../../lib/dither';
import { createRng, intFrom, rangeFrom } from '../../lib/rng';

/**
 * Stand-in project previews.
 *
 * None of these repositories has a screenshot yet, and inventing one would
 * mean showing a picture of an interface that does not exist. So the card
 * paints a placeholder instead: a dithered suggestion of an application
 * window, seeded off the project's slug so each one is distinct and identical
 * on every reload. Same ordered dither as the avatar and the boot covers, so
 * it reads as part of the piece rather than as a missing asset.
 *
 * Replace one by dropping a real PNG at `public/projects/<slug>.png` and
 * setting `preview` on the project — see `src/data/projects.ts`.
 */

/** Cells across, before the pixelated upscale. 8:5, matching the card frame. */
const CELLS_X = 64;
const CELLS_Y = 40;
/** Rows given to the window's title bar. */
const CHROME_ROWS = 5;
/**
 * Lit and unlit cell values. Kept close together and both dark: at full
 * contrast an evenly-dithered field reads as television static and pulls the
 * eye off the copy underneath, which is the opposite of what a placeholder
 * should do.
 */
const TONE_ON = 92;
const TONE_OFF = 14;

/** Turns a slug into a stable numeric seed. */
export function seedFromSlug(slug: string): number {
  let hash = 2166136261;
  for (let index = 0; index < slug.length; index += 1) {
    hash ^= slug.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

type Panel = { x: number; y: number; w: number; h: number };

export function paintProjectPreview(slug: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = CELLS_X;
  canvas.height = CELLS_Y;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const rng = createRng(seedFromSlug(slug));

  // Ramp direction, so no two projects share a gradient.
  const angle = rng() * Math.PI * 2;
  const rampX = Math.cos(angle);
  const rampY = Math.sin(angle);

  // A few brighter blocks below the title bar — the rhythm of content in a
  // screenshot, without pretending to be one.
  const panels: Panel[] = Array.from({ length: intFrom(rng, 2, 4) }, () => ({
    x: rangeFrom(rng, 3, CELLS_X - 16),
    y: rangeFrom(rng, CHROME_ROWS + 2, CELLS_Y - 8),
    w: rangeFrom(rng, 10, 26),
    h: rangeFrom(rng, 2, 6),
  }));

  const image = ctx.createImageData(CELLS_X, CELLS_Y);
  const data = image.data;

  for (let y = 0; y < CELLS_Y; y += 1) {
    for (let x = 0; x < CELLS_X; x += 1) {
      const nx = x / CELLS_X - 0.5;
      const ny = y / CELLS_Y - 0.5;

      let value: number;
      if (y < CHROME_ROWS) {
        // The title bar reads as a bar because of its edge, not its fill: an
        // unlit band, three dots, and a lit rule closing it off. Dithering the
        // fill instead just produced more of the same noise as the field.
        value = 0.08;
        if (y === 2 && (x === 3 || x === 6 || x === 9)) value = 1;
        if (y === CHROME_ROWS - 1) value = 0.95;
      } else {
        // The field itself stays almost entirely unlit — the ramp only decides
        // which corner picks up a scatter of cells. The panels below are what
        // the eye is meant to find.
        value = 0.1 + (nx * rampX + ny * rampY) * 0.16;
        for (const panel of panels) {
          const inside =
            x >= panel.x && x < panel.x + panel.w && y >= panel.y && y < panel.y + panel.h;
          if (inside) value += 0.45;
        }
        value += rng() * 0.03;
      }

      const on = value > bayerThreshold(x, y);
      const index = (y * CELLS_X + x) * 4;
      const tone = on ? TONE_ON : TONE_OFF;
      data[index] = tone;
      data[index + 1] = tone;
      data[index + 2] = tone;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}
