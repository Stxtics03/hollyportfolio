import { Link } from 'react-router-dom';
import { LinkIcon } from './LinkIcons';
import { LINKS, type SiteLink } from '../../data/links';

const TILE_BASE =
  'group border-smoke bg-ink-soft relative flex h-8 w-8 items-center justify-center rounded-[10px] border transition-all duration-200';

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
 * A single horizontal row of link tiles, sitting in the top-right of the about
 * card — the layout in SS-C rather than a side panel.
 */
export function LinksRow({ className = '' }: { className?: string }) {
  return (
    // Spacing around the row is the caller's business.
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {LINKS.map((link) => (
        // No padding here: the row's box has to be exactly one tile tall, or
        // centring it against the identity block puts the tiles off-centre by
        // half the padding. The hover label is absolute, so it needs no space
        // reserved — it overhangs into the gap above the headline.
        <li key={link.id}>
          <Tile link={link} />
        </li>
      ))}
    </ul>
  );
}
