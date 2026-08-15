/**
 * Tiny seeded PRNG (mulberry32). Every procedural element — facet
 * brightness, star placement, grain jitter — is generated from a fixed seed
 * so the composition is identical on every reload and reviewable frame by
 * frame. Change a seed to reroll a layout on purpose, never by accident.
 */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random float in [min, max). */
export function rangeFrom(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Random integer in [min, max]. */
export function intFrom(rng: () => number, min: number, max: number): number {
  return Math.floor(rangeFrom(rng, min, max + 1));
}
