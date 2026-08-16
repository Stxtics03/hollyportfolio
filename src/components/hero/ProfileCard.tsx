import { useEffect, useMemo, useState } from 'react';
import { LinksRow } from './LinksRow';
import { Terminal } from './Terminal';
import { PROFILE } from '../../data/profile';
import { createRng } from '../../lib/rng';
import { bayerThreshold } from '../../lib/dither';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/** Cells per side of the generated fallback portrait. */
const AVATAR_CELLS = 24;
/** Seconds each footer quote holds before the next one. */
const QUOTE_SECONDS = 6;

/**
 * Stand-in portrait, generated so a missing photo never leaves a broken image
 * in the card. Same ordered dither as everything else in the piece.
 */
function paintFallbackAvatar(seed: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_CELLS;
  canvas.height = AVATAR_CELLS;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const rng = createRng(seed);
  const image = ctx.createImageData(AVATAR_CELLS, AVATAR_CELLS);
  const data = image.data;

  for (let y = 0; y < AVATAR_CELLS; y += 1) {
    for (let x = 0; x < AVATAR_CELLS; x += 1) {
      const nx = x / AVATAR_CELLS - 0.5;
      const ny = y / AVATAR_CELLS - 0.5;
      // A soft blob, brightest off-centre, so it reads as a portrait mass.
      const value = Math.max(0, 0.95 - Math.hypot(nx * 1.1, ny * 1.25) * 1.9) + rng() * 0.06;
      const on = value > bayerThreshold(x, y);
      const index = (y * AVATAR_CELLS + x) * 4;
      const tone = on ? 150 : 24;
      data[index] = tone;
      data[index + 1] = tone;
      data[index + 2] = tone;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

function Avatar() {
  const [failed, setFailed] = useState(false);
  const fallback = useMemo(() => (failed ? paintFallbackAvatar(20260816) : ''), [failed]);

  return (
    <img
      src={failed ? fallback : PROFILE.avatar}
      onError={() => setFailed(true)}
      alt={PROFILE.avatarAlt}
      width={64}
      height={64}
      className="border-smoke h-16 w-16 shrink-0 rounded-2xl border object-cover"
    />
  );
}

/** Live local time in your timezone, ticking once a second. */
function LocalClock() {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone: PROFILE.availability.timeZone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
    [],
  );

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <time className="text-bone/30 tracking-label text-micro tabular-nums">
      {formatter.format(now)}
    </time>
  );
}

/** Cycles the footer quotes. Holds still under reduced motion. */
function RotatingQuote({ still }: { still: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (still) return;
    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % PROFILE.quotes.length),
      QUOTE_SECONDS * 1000,
    );
    return () => window.clearInterval(id);
  }, [still]);

  return (
    <p className="text-bone/30 tracking-body text-micro max-w-[220px] italic">
      “{PROFILE.quotes[index]}”
    </p>
  );
}

/**
 * The about card: portrait, name, handle, headline, and a working terminal.
 *
 * Same card language as the boot screen — flat fill, 1px hairline, inset top
 * highlight, no bevel and no tilt.
 */
export function ProfileCard() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="border-smoke relative overflow-hidden rounded-2xl border p-6 md:p-7"
      style={{
        background: 'linear-gradient(180deg, rgb(var(--color-ink-soft)) 0%, rgb(var(--color-ink)) 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Identity left, links right — the corner was empty, and it puts the
          outbound doors at the top of the card rather than after it. Below
          `md` they drop under the name, where a side-by-side row would not
          fit.

          The tiles are centred against the identity block, not hung from its
          top: the block is one avatar tall (64) and the row is one tile tall
          (32), so top-aligning left the icons reading 16px high against
          everything beside them. `SiteShell` derives the margin note's
          position from the same two measurements. */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-4">
          <Avatar />
          <div className="flex min-w-0 flex-col">
            <p className="text-bone tracking-heading text-lead">{PROFILE.name}</p>
            <p className="text-bone/40 tracking-body text-body">{PROFILE.handle}</p>
          </div>
        </div>

        <LinksRow className="shrink-0" />
      </div>

      <p className="text-bone tracking-heading text-lead mt-7 md:text-sub">
        {PROFILE.headline.before}{' '}
        <span className="text-acid pixel-bold">{PROFILE.headline.lead}</span>
        {PROFILE.headline.after}
      </p>

      <p className="text-bone/60 tracking-body text-body mt-2 max-w-[52ch]">{PROFILE.bio}</p>

      <div className="mt-7">
        <Terminal />
      </div>

      {/* Footer: a joke on the left, live availability on the right.

          Both columns are 12px/20px type, so they line up line-for-line as
          long as neither side adds spacing of its own — hence `items-start`
          and no gap in the right-hand column. With a gap the two stacks were
          4px out of step, which is exactly the kind of near-miss that reads as
          sloppy rather than as a deliberate offset. */}
      <div className="border-smoke-soft mt-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-t pt-4">
        <RotatingQuote still={reducedMotion} />

        <div className="flex flex-col items-end">
          <p className="text-bone/70 tracking-label text-micro flex items-center gap-2">
            <span className="relative flex h-2 w-2" aria-hidden>
              {PROFILE.availability.available && !reducedMotion ? (
                <span className="bg-acid absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
              ) : null}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  PROFILE.availability.available ? 'bg-acid' : 'bg-bone/40'
                }`}
              />
            </span>
            {PROFILE.availability.label}
          </p>
          <LocalClock />
        </div>
      </div>
    </div>
  );
}
