/**
 * 8×8 ordered (Bayer) threshold matrix — the classic 1-bit dither kernel.
 * Values 0–63; a source luminance either beats the threshold or it doesn't,
 * which is what gives ordered dithering its hard, mechanical texture.
 */
export const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
] as const;

/** Normalised threshold for a cell, in 0–1. */
export function bayerThreshold(x: number, y: number): number {
  return (BAYER_8[y & 7][x & 7] + 0.5) / 64;
}
