export type LinkId = 'github' | 'x' | 'gmail' | 'linkedin' | 'blog';

export type SiteLink = {
  id: LinkId;
  /** Revealed under the tile on hover. */
  label: string;
  /**
   * `null` renders the tile dimmed and non-interactive rather than shipping a
   * dead link. Fill it in and the tile comes alive — nothing else to change.
   */
  href: string | null;
  /** Internal route rather than an outbound link. */
  internal?: boolean;
};

/**
 * The wordmark reads as two hard-wrapped lines, exactly as in SS-A/SS-B.
 */
export const LINKS_WORDMARK = ['LIN', 'KS.'] as const;

export const LINKS: SiteLink[] = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/Stxtics03' },
  { id: 'x', label: 'X', href: 'https://x.com/Stxtics3' },

  { id: 'gmail', label: 'Email', href: 'mailto:shrstha.2005@gmail.com' },

  // Tracking parameters stripped — `utm_source=share_via` and friends only
  // tell LinkedIn where the click came from, and they make the URL unreadable.
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/shrestha-chandra-787452311',
  },

  // The sixth tile. Pointing it at the blog keeps the grid full and useful.
  { id: 'blog', label: 'Blog', href: '/blog', internal: true },
];
