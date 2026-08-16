import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useInViewOnce } from '../../hooks/useInViewOnce';
import { EASE_REVEAL } from '../../lib/easings';

type SectionProps = {
  /** Anchor target; nav links jump here. Also ties the heading to the region. */
  id: string;
  /**
   * The small mono label above the block — `* tech stack`, `01 about`. The
   * marker is rendered in `acid`, the label in dimmed bone.
   */
  label: string;
  /** Marker before the label. `*` across the site — see `data/site.ts`. */
  marker?: string;
  /** Rendered full-bleed, outside the column. */
  bleed?: ReactNode;
  /** Skip the reveal (reduced motion). */
  still?: boolean;
  /**
   * Override the column width for this block, in px. The spine is 640 and
   * everything should stay on it; the hero is the one exception, because a
   * two-column row with a terminal in it cannot breathe at 640.
   */
  width?: number;
  children: ReactNode;
};

/**
 * One block of the page.
 *
 * The spine of this layout is a single narrow centred column; the only things
 * allowed outside it are dividers and deliberate full-bleed content passed as
 * `bleed`. Reveal is fade + 12px rise, once, never on scroll-up.
 */
export function Section({
  id,
  label,
  marker = '*',
  bleed,
  still = false,
  width = 640,
  children,
}: SectionProps) {
  const { ref, inView } = useInViewOnce<HTMLElement>({ disabled: still });
  const headingId = `${id}-label`;

  return (
    <section ref={ref} id={id} aria-labelledby={headingId} className="scroll-mt-24">
      <motion.div
        initial={still ? false : { opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.6, ease: EASE_REVEAL }}
      >
        <div className="mx-auto w-full px-6" style={{ maxWidth: width }}>
          {/* Section headers carry the page's structure, so they are sized to
              be read at a glance rather than hunted for. Tracking eases off as
              the size goes up — label spacing that reads as deliberate at 12px
              reads as broken at 24px. */}
          <h2 id={headingId} className="tracking-heading text-sub mb-8 flex items-center gap-3">
            <span className="text-acid" aria-hidden>
              {marker}
            </span>
            {/* No case override: the base stylesheet uppercases every heading,
                and section labels are headings like any other. */}
            <span className="text-bone/70">{label}</span>
          </h2>

          {children}
        </div>

        {bleed}
      </motion.div>
    </section>
  );
}
