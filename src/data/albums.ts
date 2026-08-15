import { bayerThreshold } from '../lib/dither';
import { createRng, rangeFrom } from '../lib/rng';

export type Album = {
  title: string;
  artist: string;
  /** Anything an <img> can load: a data URL, or a path under /public. */
  cover: string;
};

/** Cells per side of a placeholder cover, before pixelated upscaling. */
const COVER_CELLS = 56;

/**
 * Paint one placeholder cover: a two-tone gradient run through the same
 * ordered dither as everything else in this piece, with a seeded ramp
 * direction and a 1-cell frame so covers read as distinct objects rather than
 * as one repeating texture.
 *
 * These exist only so the marquee has something to move before real art shows
 * up. Nothing here is precious.
 */
function paintPlaceholderCover(seed: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = COVER_CELLS;
  canvas.height = COVER_CELLS;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const rng = createRng(seed);
  const angle = rangeFrom(rng, 0, Math.PI * 2);
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);
  // Near-monochrome by design. Placeholders are scaffolding — they must not
  // start competing with the acid, which is the composition's only loud
  // colour. Just enough hue that the marquee's desaturation of the off-centre
  // covers is visible at all; real album art will bring its own.
  const hue = Math.floor(rangeFrom(rng, 0, 360));
  const saturation = rangeFrom(rng, 0.04, 0.1);
  const lightness = rangeFrom(rng, 0.26, 0.44);
  const tone = rangeFrom(rng, 0.5, 0.9);

  const image = ctx.createImageData(COVER_CELLS, COVER_CELLS);
  const data = image.data;

  for (let y = 0; y < COVER_CELLS; y += 1) {
    for (let x = 0; x < COVER_CELLS; x += 1) {
      const nx = x / COVER_CELLS - 0.5;
      const ny = y / COVER_CELLS - 0.5;

      // Projection onto the ramp direction, remapped to 0–1.
      const ramp = (nx * dirX + ny * dirY + 0.7) / 1.4;
      const frame = x === 0 || y === 0 || x === COVER_CELLS - 1 || y === COVER_CELLS - 1;
      const value = frame ? 1 : Math.min(Math.max(ramp * tone, 0), 1);

      const on = value > bayerThreshold(x, y);
      const index = (y * COVER_CELLS + x) * 4;

      if (on) {
        const [r, g, b] = hslToRgb(hue / 360, saturation, lightness);
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
      } else {
        data[index] = 14;
        data[index + 1] = 14;
        data[index + 2] = 14;
      }
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// ---------------------------------------------------------------------------
// DROP YOUR OWN COVERS HERE.
//
// Replace each `cover` with a path to a real image — put the files in
// `public/albums/` and reference them as '/albums/whatever.jpg'. Keep them
// square. `useBootProgress` preloads every entry in this array and won't let
// the progress bar past its cap until they've all decoded, so this list is
// load-bearing, not decorative.
//
// Titles and artists are yours to change too; nothing reads them yet, but the
// marquee will surface them if you ever want captions.
// ---------------------------------------------------------------------------
export const ALBUMS: Album[] = [
  { title: 'Placeholder 01', artist: 'Replace me', cover: paintPlaceholderCover(101) },
  { title: 'Placeholder 02', artist: 'Replace me', cover: paintPlaceholderCover(202) },
  { title: 'Placeholder 03', artist: 'Replace me', cover: paintPlaceholderCover(303) },
  { title: 'Placeholder 04', artist: 'Replace me', cover: paintPlaceholderCover(404) },
  { title: 'Placeholder 05', artist: 'Replace me', cover: paintPlaceholderCover(505) },
  { title: 'Placeholder 06', artist: 'Replace me', cover: paintPlaceholderCover(606) },
  { title: 'Placeholder 07', artist: 'Replace me', cover: paintPlaceholderCover(707) },
  { title: 'Placeholder 08', artist: 'Replace me', cover: paintPlaceholderCover(808) },
];
