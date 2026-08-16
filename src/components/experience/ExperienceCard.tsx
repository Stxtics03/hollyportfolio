import { useState } from 'react';
import { motion } from 'framer-motion';
import { BRAND_MARKS, markFill } from '../stack/techIcons';
import { EASE_REVEAL } from '../../lib/easings';
import type { Experience, InfoPoint } from '../../data/experience';
import type { TechRef } from '../../data/projects';

/** Per-card delay in the list's stagger, seconds. */
const STAGGER_SECONDS = 0.08;

/** Initials, for a company with no logo file yet. */
function monogram(company: string): string {
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

/**
 * The company mark.
 *
 * A real logo when there is one, its initials when there is not — the same
 * `onError` fallback the portrait and the project previews use, so a missing
 * or mistyped file degrades to something deliberate instead of a broken image.
 *
 * Squared rather than round, at the same corner-to-side ratio as the portrait
 * (`rounded-2xl` on 64px) and the link tiles. Most company marks are drawn on
 * a square, so a circle crops the corners off them for nothing.
 */
function Logo({ item }: { item: Experience }) {
  const [failed, setFailed] = useState(false);

  if (!item.logo || failed) {
    return (
      <div
        className="border-smoke bg-ink-soft text-bone/70 tracking-label flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border text-[11px]"
        aria-hidden
      >
        {monogram(item.company)}
      </div>
    );
  }

  return (
    <img
      src={item.logo}
      onError={() => setFailed(true)}
      alt=""
      width={40}
      height={40}
      aria-hidden
      className="border-smoke h-10 w-10 shrink-0 rounded-[10px] border object-cover"
    />
  );
}

/** One technology, as a bordered pill with its brand mark. */
function TechPill({ tech }: { tech: TechRef }) {
  const mark = BRAND_MARKS[tech.slug];

  return (
    <li className="border-smoke bg-ink-soft text-bone/75 tracking-label text-micro flex items-center gap-2 rounded-[10px] border px-2.5 py-1">
      {mark ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          style={{ fill: markFill(mark.hex) }}
          className="shrink-0"
          aria-hidden
        >
          <path d={mark.path} />
        </svg>
      ) : null}
      {tech.name}
    </li>
  );
}

/** Small mono heading over a block inside the card. */
function BlockLabel({ children }: { children: string }) {
  return <p className="text-bone/35 tracking-label text-micro mb-3 uppercase">{children}</p>;
}

function InfoBullet({ point }: { point: InfoPoint }) {
  return (
    <li className="flex gap-3">
      <span className="bg-acid mt-[9px] h-[3px] w-[3px] shrink-0" aria-hidden />
      <p className="text-bone/55 tracking-body text-micro">
        <span className="text-bone/90 pixel-bold">{point.lead}</span>
        {point.rest ? ` ${point.rest}` : null}
      </p>
    </li>
  );
}

/**
 * One job.
 *
 * Identity on the left, dates on the right, then the stack and the info points
 * as separate labelled blocks — the layout of the reference, in this site's
 * type and card language. Every block below the header is conditional, so an
 * entry with nothing but a company and a date range still renders as a
 * finished card rather than as a set of empty headings.
 */
export function ExperienceCard({
  item,
  index,
  still,
}: {
  item: Experience;
  index: number;
  still: boolean;
}) {
  const hasTech = Boolean(item.tech?.length);
  const hasInfo = Boolean(item.info?.length);

  return (
    <motion.article
      className="border-smoke bg-ink/85 rounded-2xl border p-6 backdrop-blur-sm md:p-7"
      initial={still ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: still ? 0 : 0.5,
        delay: still ? 0 : index * STAGGER_SECONDS,
        ease: EASE_REVEAL,
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Logo item={item} />
          <div className="flex min-w-0 flex-col">
            <h3 className="text-bone tracking-heading text-body normal-case">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-acid focus-ring rounded-[4px] transition-colors"
                >
                  {item.company}
                  <span aria-hidden> ↗</span>
                </a>
              ) : (
                item.company
              )}
            </h3>
            {item.role ? (
              <p className="text-acid tracking-body text-micro mt-1">{item.role}</p>
            ) : null}
          </div>
        </div>

        {/* Dates and place read as one right-aligned block, as in the
            reference. On a phone they sit under the company instead, where a
            second column would leave the title two words wide. */}
        <div className="flex shrink-0 flex-col sm:items-end">
          <p className="text-bone/50 tracking-label text-micro tabular-nums">
            {item.start} — {item.end}
          </p>
          {item.location ? (
            <p className="text-bone/30 tracking-label text-micro mt-1">{item.location}</p>
          ) : null}
        </div>
      </div>

      {item.summary ? (
        <p className="text-bone/55 tracking-body text-micro mt-5 max-w-[62ch]">{item.summary}</p>
      ) : null}

      {hasTech ? (
        <div className="mt-6">
          <BlockLabel>Technologies</BlockLabel>
          <ul className="flex flex-wrap gap-2">
            {item.tech?.map((tech) => (
              <TechPill key={tech.slug} tech={tech} />
            ))}
          </ul>
        </div>
      ) : null}

      {hasInfo ? (
        <div className="border-smoke-soft mt-6 border-t pt-5">
          <BlockLabel>Info</BlockLabel>
          <ul className="flex flex-col gap-3">
            {item.info?.map((point) => (
              <InfoBullet key={point.lead} point={point} />
            ))}
          </ul>
        </div>
      ) : null}
    </motion.article>
  );
}
