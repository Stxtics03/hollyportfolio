import type { Config } from 'tailwindcss';

/**
 * One typeface for the whole site: Departure Mono.
 *
 * `sans` and `mono` resolve to the exact same stack on purpose — nothing in the
 * app can accidentally fall into a proportional face, including Tailwind's own
 * `font-sans` default on <body> and any `prose`-ish defaults added later.
 * Hierarchy comes from size / weight / color / spacing, never from mixing faces.
 */
const DEPARTURE_STACK = [
  'Departure Mono',
  'ui-monospace',
  'SFMono-Regular',
  'Menlo',
  'Consolas',
  'DejaVu Sans Mono',
  'monospace',
];

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    /**
     * REPLACES Tailwind's scale rather than extending it. A bitmap face blurs
     * the moment a glyph lands off the pixel grid, so only these eight integer
     * px sizes exist — `text-lg` (18px) and `text-3xl` (30px) are gone on
     * purpose, and there is no `clamp()` anywhere in the app. Responsive
     * headlines step between these tokens at breakpoints instead.
     *
     * Line-heights are integers too, so successive baselines stay on-grid.
     */
    fontSize: {
      micro: ['12px', '20px'],
      body: ['16px', '28px'], // ~1.75 — the "bitmap type needs air" default
      lead: ['20px', '34px'],
      sub: ['24px', '40px'],
      title: ['32px', '40px'],
      'display-sm': ['48px', '52px'],
      display: ['64px', '64px'],
      hero: ['96px', '92px'],
    },
    extend: {
      fontFamily: {
        sans: DEPARTURE_STACK,
        mono: DEPARTURE_STACK,
        // Alias kept so display-level components read intentionally, even
        // though it is the same face — size and tracking do the shouting.
        display: DEPARTURE_STACK,
      },
      letterSpacing: {
        // Bitmap type needs air. These are the two global defaults.
        body: '0.05em',
        heading: '0.08em',
        // Micro-labels / status text want more.
        label: '0.16em',
        ticker: '0.24em',
      },
      lineHeight: {
        body: '28px',
        tight: '20px',
        display: '0.92',
      },
      colors: {
        ink: {
          DEFAULT: '#0A0A0A',
          soft: '#0E0E0E',
          lift: '#141414',
        },
        acid: {
          DEFAULT: '#C8F542',
          deep: '#9FC72F',
          glow: '#DBFF6B',
        },
        bone: '#F2F2F2',
        smoke: {
          DEFAULT: 'rgba(255,255,255,0.09)',
          soft: 'rgba(255,255,255,0.06)',
          hard: 'rgba(255,255,255,0.12)',
        },
      },
      boxShadow: {
        card: '0 40px 120px -40px rgba(200,245,66,0.18), 0 0 0 1px rgba(255,255,255,0.06)',
        'card-inset': 'inset 0 1px 0 rgba(255,255,255,0.07)',
      },
      borderRadius: {
        card: '28px',
      },
    },
  },
  plugins: [],
} satisfies Config;
