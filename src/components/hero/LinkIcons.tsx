import type { LinkId } from '../../data/links';

/**
 * Monochrome marks, drawn on one 24×24 grid so they sit at a consistent
 * optical weight beside each other. They inherit `currentColor`, which is what
 * lets the tiles brighten on hover without a second set of assets.
 */
const ICONS: Record<LinkId, JSX.Element> = {
  github: (
    <path
      d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
      fill="currentColor"
    />
  ),
  x: (
    <path
      d="M13.8 10.6 20.5 3h-1.6l-5.8 6.6L8.4 3H3l7 10-7 8h1.6l6.1-7 4.9 7H21l-7.2-10.4Zm-2.2 2.5-.7-1L5.2 4.2h2.4l4.5 6.4.7 1 5.9 8.4h-2.4l-4.8-6.9Z"
      fill="currentColor"
    />
  ),
  gmail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="m3.6 6.6 8.4 6.2 8.4-6.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </>
  ),
  linkedin: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 10v7M7 6.6v.1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="square" />
      <path
        d="M11 17v-7m0 2.2c.5-1.4 1.7-2.2 3-2.2 1.8 0 3 1.2 3 3.4V17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </>
  ),
  blog: (
    <>
      <rect x="3.5" y="3" width="17" height="18" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </>
  ),
};

export function LinkIcon({ id }: { id: LinkId }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden focusable="false">
      {ICONS[id]}
    </svg>
  );
}
