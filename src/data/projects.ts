/**
 * The work shown in the `projects` section.
 *
 * Shape ported from `D:\Program\Portfolio-latest` (`src/constants/index.js`,
 * the `projects` array) so the cards carry the same fields its `ProjectCard`
 * did — preview, title, description, tech, links. Two deliberate changes: the
 * `category` line is dropped, because the reference layout this is built to
 * puts the year in that slot instead, and `github`/`live` are separate links
 * rather than one card-wide anchor, so a project with no deployment simply
 * shows one link instead of a dead one.
 *
 * Every description here is written from the repository's own README. None of
 * these three repos carries a GitHub description or a homepage, so nothing in
 * this file can be regenerated from the API — it is hand-written copy and
 * should be edited as such.
 *
 * LENGTH BUDGET: keep `description` at or under ~85 characters. The card does
 * not clamp the text, on purpose — a card trailing off in `…` advertises a
 * "read more" that does not exist. At the two-column width a line holds about
 * 30 characters, so ~85 is three lines, and anything longer simply makes that
 * one card taller than the rest of its row.
 */

/** A brand mark to draw on a card. `slug` must exist in `BRAND_MARKS`. */
export type TechRef = {
  name: string;
  slug: string;
};

export type Project = {
  /** Stable id. Seeds the generated preview, and names the real one. */
  slug: string;
  title: string;
  /** Shown against the title, as in the reference layout. */
  year: string;
  description: string;
  tech: TechRef[];
  github?: string;
  /** Omitted when nothing is deployed — the card then shows no `live` link. */
  live?: string;
  /**
   * A real screenshot under `public/projects/`. Optional on purpose: when it
   * is missing, or fails to load, the card paints a dithered stand-in rather
   * than showing a broken frame. Drop a PNG at `/projects/<slug>.png` and set
   * this to start using it.
   */
  preview?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: 'voice-to-voice-agent',
    title: 'Voice-to-Voice Agent',
    year: '2026',
    description: 'Spoken agent that infers how you feel and adapts its reply. 4.60% WER.',
    tech: [
      { name: 'Python', slug: 'python' },
      { name: 'PyTorch', slug: 'pytorch' },
      { name: 'Jupyter', slug: 'jupyter' },
      { name: 'Flask', slug: 'flask' },
    ],
    github: 'https://github.com/Stxtics03/VTV-adaptive-conversational-agent-with-SAI',
  },
  {
    slug: 'neural-network-compression',
    title: 'Neural Network Compression',
    year: '2026',
    description: 'LeNet-5 compressed 147× at 0.54pp accuracy loss, five techniques deep.',
    tech: [
      { name: 'Python', slug: 'python' },
      { name: 'PyTorch', slug: 'pytorch' },
      { name: 'NumPy', slug: 'numpy' },
    ],
    github: 'https://github.com/Stxtics03/Neural-Network-Comp',
  },
  {
    slug: 'infralock',
    title: 'InfraLock',
    year: '2026',
    description: 'Cloud security and compliance — automated checks, alerts, audit trail.',
    tech: [
      { name: 'React', slug: 'react' },
      { name: 'Express', slug: 'express' },
      { name: 'MySQL', slug: 'mysql' },
      { name: 'Docker', slug: 'docker' },
    ],
    github: 'https://github.com/Stxtics03/infralock',
  },
];
