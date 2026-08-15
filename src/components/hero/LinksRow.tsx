import { Link } from 'react-router-dom';
import { LinkIcon } from './LinkIcons';
import { SayHiArrow, SAY_HI_TIP_OFFSET } from './SayHiArrow';
import { LINKS, type SiteLink } from '../../data/links';

const TILE_BASE =
  'group border-smoke bg-ink-soft relative flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200';

/** The platform name, revealed under a tile on hover. */
function TileLabel({ label }: { label: string }) {
  return (
    <span
      aria-hidden
      className="text-bone/50 tracking-label text-micro pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    >
      {label}
    </span>
  );
}

function Tile({ link }: { link: SiteLink }) {
  // Icons sit bright by default, as in the reference — these are the page's
  // outbound doors, not decoration.
  const live = `${TILE_BASE} text-bone/85 hover:text-bone hover:border-smoke-hard focus-ring hover:-translate-y-[2px]`;

  // No handle yet: render the tile, but never as a link that goes nowhere.
  if (!link.href) {
    return (
      <div
        className={`${TILE_BASE} text-bone/20 cursor-default`}
        title={`${link.label} — not linked yet`}
        aria-label={`${link.label}: coming soon`}
      >
        <LinkIcon id={link.id} />
      </div>
    );
  }

  if (link.internal) {
    return (
      <Link to={link.href} aria-label={link.label} className={live}>
        <LinkIcon id={link.id} />
        <TileLabel label={link.label} />
      </Link>
    );
  }

  return (
    <a
      href={link.href}
      aria-label={link.label}
      // mailto: must not carry target/rel — only real outbound links do.
      {...(link.href.startsWith('mailto:')
        ? {}
        : { target: '_blank', rel: 'noreferrer noopener' })}
      className={live}
    >
      <LinkIcon id={link.id} />
      <TileLabel label={link.label} />
    </a>
  );
}

/**
 * A single horizontal row of link tiles, sitting directly under the about
 * card in the same column — the layout in SS-C rather than a side panel.
 *
 * `say hi` is pinned to the left of the row on wide screens and hidden below
 * `md`, where there is no margin for it to live in and it would push the tiles
 * off their line.
 */
export function LinksRow() {
  return (
    // The note is a flex sibling rather than an absolutely positioned overlay,
    // so its arrow lines up with the tiles by layout instead of by guessed
    // offsets. `SAY_HI_TIP_OFFSET` pulls it up by exactly the distance between
    // the arrow's tip and the tile row's centre line.
    // The note hangs above the row by `SAY_HI_TIP_OFFSET`, so the gap under
    // the card has to cover that overhang as well — at a smaller margin the
    // handwriting ran into the card's bottom edge.
    <div className="mt-20 flex items-start">
      <SayHiArrow className="hidden md:block" style={{ marginTop: SAY_HI_TIP_OFFSET }} />

      <ul className="flex flex-wrap items-center gap-3">
        {LINKS.map((link) => (
          <li key={link.id} className="pb-5">
            <Tile link={link} />
          </li>
        ))}
      </ul>
    </div>
  );
}
