import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BRAND_MARKS } from '../stack/techIcons';
import { paintProjectPreview } from './projectPreview';
import { EASE_REVEAL } from '../../lib/easings';
import type { Project, TechRef } from '../../data/projects';

/** Per-card delay in the grid's stagger, seconds. */
const STAGGER_SECONDS = 0.08;

/**
 * The card's picture.
 *
 * A real screenshot if the project has one, otherwise a generated stand-in —
 * the same `onError` fallback the portrait uses, so a deleted or mistyped file
 * degrades to the placeholder instead of a broken frame. Colour is held back
 * until hover, as in the layout this is ported from; the generated previews
 * are monochrome anyway, so the filter only reads on real screenshots.
 */
function Preview({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  const generated = useMemo(
    () => (project.preview && !failed ? '' : paintProjectPreview(project.slug)),
    [project.preview, project.slug, failed],
  );
  const usingRealShot = Boolean(project.preview) && !failed;

  return (
    <div className="border-smoke-soft relative aspect-[8/5] w-full overflow-hidden border-b">
      <img
        src={usingRealShot ? project.preview : generated}
        onError={() => setFailed(true)}
        alt={usingRealShot ? `${project.title} screenshot` : ''}
        // The generated art is 64×40 and meant to be seen as cells, so it is
        // scaled with nearest-neighbour rather than smoothed into mush.
        style={usingRealShot ? undefined : { imageRendering: 'pixelated' }}
        aria-hidden={!usingRealShot}
        className="h-full w-full object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-[1.02] group-hover:grayscale-0"
      />
    </div>
  );
}

/** One brand mark. Anything without a mark in the registry is skipped. */
function TechDot({ tech }: { tech: TechRef }) {
  const mark = BRAND_MARKS[tech.slug];
  if (!mark) return null;

  return (
    <li
      className="border-smoke bg-ink-soft flex h-7 w-7 items-center justify-center rounded-full border"
      title={tech.name}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        // Same treatment as the marquee: the brand colour is always in the
        // markup, and the card decides how much of it to show.
        style={{ fill: `#${mark.hex}` }}
        className="opacity-80 transition-opacity duration-200 group-hover:opacity-100"
        aria-hidden
      >
        <path d={mark.path} />
      </svg>
      <span className="sr-only">{tech.name}</span>
    </li>
  );
}

function CardLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-bone/50 hover:text-bone focus-ring tracking-label text-micro inline-flex items-center gap-1 rounded-[4px] transition-colors"
    >
      {label}
      <span aria-hidden>↗</span>
    </a>
  );
}

/**
 * One project.
 *
 * Layout follows the reference: picture, then title against the year, then the
 * description, the stack, and the outbound links. The card is a container of
 * links rather than one big anchor — a project with a repo and a deployment
 * has two destinations, and burying one inside the other makes the second
 * unreachable by keyboard.
 */
export function ProjectCard({
  project,
  index,
  still,
}: {
  project: Project;
  index: number;
  still: boolean;
}) {
  return (
    <motion.article
      className="border-smoke bg-ink/85 group flex flex-col overflow-hidden rounded-2xl border backdrop-blur-sm transition-[transform,border-color] duration-200 hover:-translate-y-[2px] hover:border-[var(--smoke-hard)]"
      initial={still ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: still ? 0 : 0.5,
        delay: still ? 0 : index * STAGGER_SECONDS,
        ease: EASE_REVEAL,
      }}
    >
      <Preview project={project} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          {/* `normal-case` on purpose: the base stylesheet uppercases every
              heading, which turns names that carry their own casing —
              InfraLock, Voice-to-Voice — into something the projects are not
              called. The reference layout sets them in mixed case too. */}
          <h3 className="text-bone tracking-heading text-body normal-case">{project.title}</h3>
          <span className="text-bone/30 tracking-label text-micro shrink-0 tabular-nums">
            {project.year}
          </span>
        </div>

        {/* Clamped rather than truncated in the data, so the full sentence is
            still in the DOM for anything reading the page rather than looking
            at it. */}
        <p className="text-bone/60 tracking-body text-micro mt-3 line-clamp-3">
          {project.description}
        </p>

        {/* Pushed to the bottom so the stack and links sit on one line across
            the row, however long the descriptions run. */}
        <ul className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          {project.tech.map((tech) => (
            <TechDot key={tech.slug} tech={tech} />
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {project.github ? <CardLink href={project.github} label="github" /> : null}
          {project.live ? <CardLink href={project.live} label="live" /> : null}
        </div>
      </div>
    </motion.article>
  );
}
