export type Post = {
  slug: string;
  title: string;
  /** ISO date — formatted at render, never stored pre-formatted. */
  date: string;
  summary: string;
  /** Minutes. Shown as a duration, keeping the music-app through-line. */
  readingMinutes: number;
  tags: string[];
};

// ---------------------------------------------------------------------------
// YOUR POSTS GO HERE.
//
// Add entries to this array and the blog index renders them. When you're ready
// for real post bodies, this is the shape a CMS or a content-collection loader
// should produce — keep `slug` stable, it will become the URL.
// ---------------------------------------------------------------------------
export const POSTS: Post[] = [
  {
    slug: 'placeholder-first-post',
    title: 'Placeholder — replace me',
    date: '2026-08-15',
    summary:
      'A stand-in entry so the index has something to lay out. Delete it once the first real post lands.',
    readingMinutes: 4,
    tags: ['devops', 'notes'],
  },
];
