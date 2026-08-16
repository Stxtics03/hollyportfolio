/**
 * Everything the shell says out loud. No copy is hardcoded inside components —
 * edit the site's words here.
 */

export type NavLink = {
  label: string;
  /**
   * Either an in-page anchor (`#about`) or a route (`/blog`). Anchors resolve
   * against the home route, so they still work when clicked from another page.
   */
  href: string;
  /** True when this is a route change rather than a jump within the page. */
  isRoute?: boolean;
};

export const WORDMARK = 'SHRESTHA.EXE';

export const NAV_LINKS: NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Blog', href: '/blog', isRoute: true },
  { label: 'Projects', href: '#projects' },
];

export type SectionMeta = {
  id: string;
  /** Small mono label above the block. */
  label: string;
  /**
   * The glyph before the label, drawn in the accent. `*` throughout: the
   * numbered variant implied a running order the page does not actually have,
   * and left `tech stack` looking like an aside between two numbered blocks
   * rather than a section in its own right.
   */
  marker: string;
};

/** Blog lives on its own route, so it is not a section of the home page. */
export const SECTIONS = {
  about: { id: 'about', label: 'about', marker: '*' },
  stack: { id: 'stack', label: 'tech stack', marker: '*' },
  projects: { id: 'projects', label: 'projects', marker: '*' },
  experience: { id: 'experience', label: 'work experience', marker: '*' },
} as const satisfies Record<string, SectionMeta>;

export const BLOG_META = {
  label: 'blog',
  marker: '*',
  title: 'Writing',
  intro: 'Notes on infrastructure, backend work, and whatever broke recently.',
  /** Shown when there are no posts yet. */
  empty: 'Nothing published yet. The first post is being written.',
} as const;
