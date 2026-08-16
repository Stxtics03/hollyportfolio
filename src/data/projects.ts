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
    description:
      'A real-time spoken agent that hears what you said, infers how you appear to feel, and replies with speech whose delivery adapts to your state. Whisper STT through affect inference to expressive TTS, at 4.60% WER against an 8.72% target.',
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
    description:
      'Compressing LeNet-5 on MNIST across five techniques — magnitude pruning, quantization, clustering, L0 structured sparsity and QAT. 147× smaller at 0.54pp accuracy loss, with the two negative results kept in because they are the useful part.',
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
    description:
      'Infrastructure security and compliance platform. Automated compliance checks, vulnerability detection, AI-assisted configuration analysis and real-time alerts, over a complete audit trail of every change and remediation.',
    tech: [
      { name: 'React', slug: 'react' },
      { name: 'Express', slug: 'express' },
      { name: 'MySQL', slug: 'mysql' },
      { name: 'Docker', slug: 'docker' },
    ],
    github: 'https://github.com/Stxtics03/infralock',
  },
];
