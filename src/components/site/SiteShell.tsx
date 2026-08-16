import { HatchDivider } from '../layout/HatchDivider';
import { Header } from '../layout/Header';
import { Section } from '../layout/Section';
import { ProfileCard } from '../hero/ProfileCard';
import { ProjectGrid } from '../projects/ProjectGrid';
import { ExperienceList } from '../experience/ExperienceList';
import { TechMarquee } from '../stack/TechMarquee';
import { TreeField } from '../tree/TreeField';
import { SECTIONS } from '../../data/site';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Every tunable in the site shell, the same way `BOOT_CONFIG` works for the
 * loader. Nothing below hardcodes a measurement.
 *
 * STAGE 1 of 8: column, section + divider primitives, header, scaffolding.
 * Still to come: theme toggle, hero, tech marquee, pixel tree, playlist and
 * timeline, the responsive/a11y pass, and the optional cursor cat.
 */
export const SITE_CONFIG = {
  /** The spine. Everything lives in this column; only dividers break out. */
  columnWidth: 640,
  /** Vertical rhythm between blocks, px. */
  sectionGap: 72,
  /**
   * The heatmap tree and its grid field, behind the work sections. Ported
   * from Lakshya Kumar's portfolio with permission — see `components/tree/`.
   * The tree samples a silhouette into an 8px grid and grows outward from the
   * root; the grid fills the rest of the field with "empty" cells that
   * shimmer near the cursor and ripple on click.
   */
  tree: {
    /** Anchored bottom-right, as in the reference. */
    anchor: 'bottom-right' as const,
    /** Scale of the silhouette within the canvas. */
    fillFactor: 0.94,
    /**
     * Cursor response. 'illumination' is the one that does NOT move the tree:
     * cells near the pointer brighten and the rest dims slightly, so the
     * shape stays perfectly still and only the light travels.
     *
     * The other modes the original ships all displace cells — 'glide' leans
     * the whole tree, 'yaw' turns it, 'bend' arcs it, 'magnet' pulls nearby
     * cells, 'shimmer' jitters them.
     */
    mode: 'illumination' as const,
    /** Extra brightness at the cursor. */
    illumBoost: 1.6,
    /** How much the rest of the tree dims while hovering. */
    illumDim: 0.45,
    /**
     * Overall opacity of the whole field. 1 is exactly how the original
     * renders it — on its own full-bleed page, with nothing on top. Here the
     * copy sits over it, so it is dialled back until the type wins.
     */
    opacity: 0.5,
    /**
     * How far the field extends above its section. Sized to land in the clear
     * gap between the divider above and the first section — go past the
     * divider and the hatch band ends up drawn on top of the grid, which is
     * the seam we removed at the bottom of the page.
     */
    topBleed: 56,
    /** Height of the fade at the field's top edge, so it dissolves. */
    topFade: 40,
  },
  /** Two rows, opposite directions, speeds that never divide into each other. */
  marquee: {
    topSeconds: 40,
    bottomSeconds: 48,
    /** Narrower container, so the fades come in tighter. */
    fade: 48,
  },
  hatch: {
    height: 24,
    angle: -45,
    gap: 7,
    weight: 1,
    /** Low-contrast on purpose — the band is a rule, not an element. */
    color: 'rgba(255,255,255,0.08)',
    edgeColor: 'rgba(255,255,255,0.05)',
  },
} as const;

export function SiteShell() {
  const reducedMotion = useReducedMotion();
  const gap = { marginTop: SITE_CONFIG.sectionGap, marginBottom: SITE_CONFIG.sectionGap };

  return (
    <div id="top" className="bg-ink min-h-[100dvh] w-full">
      <Header />

      {/* The bottom padding lives on the tree's wrapper, not here — see the
          note there. `main` padding would sit outside it and unpin the tree. */}
      <main className="pt-14">
        <div style={{ height: SITE_CONFIG.sectionGap }} />

        <Section
          id={SECTIONS.about.id}
          label={SECTIONS.about.label}
          marker={SECTIONS.about.marker}
          still={reducedMotion}
        >
          <ProfileCard />
        </Section>

        <div style={gap}>
          <HatchDivider tuning={SITE_CONFIG.hatch} />
        </div>

        {/* Inside the column, not full-bleed: the rows belong to the same
            spine as everything else, and edge-to-edge they read as a separate
            band bolted onto the page. */}
        <Section
          id={SECTIONS.stack.id}
          label={SECTIONS.stack.label}
          marker={SECTIONS.stack.marker}
          still={reducedMotion}
        >
          <TechMarquee tuning={SITE_CONFIG.marquee} />
        </Section>

        <div style={gap}>
          <HatchDivider tuning={SITE_CONFIG.hatch} />
        </div>

        {/* The tree lives behind these two sections. It sticks to the viewport
            while they scroll past, so it grows in place rather than sliding
            up out of frame. STAGE 6 replaces the placeholders with the
            playlist and timeline, on translucent cards so it reads through.

            This wrapper has to run to the very bottom of the page, and that is
            what the trailing space below is doing inside it rather than after
            it. A sticky element only stays pinned while its container is still
            passing the viewport: give the container less height than the page
            has scroll left, and the tree comes unpinned and slides up for the
            last screenful — which is the one thing this layout is trying not
            to do. Anything added below the sections belongs in here too. */}
        <div className="relative pb-32">
          <TreeField tuning={SITE_CONFIG.tree} className="z-0" />

          <div className="relative z-10">
            <Section
              id={SECTIONS.projects.id}
              label={SECTIONS.projects.label}
              marker={SECTIONS.projects.marker}
              still={reducedMotion}
            >
              <ProjectGrid still={reducedMotion} />
            </Section>

            <div style={gap} />

            <Section
              id={SECTIONS.experience.id}
              label={SECTIONS.experience.label}
              marker={SECTIONS.experience.marker}
              still={reducedMotion}
            >
              <ExperienceList still={reducedMotion} />
            </Section>
          </div>

          {/* No closing hatch band here on purpose: it cut straight across the
              tree's grid field, which reads as a seam through the artwork
              rather than as a rule between sections. The field itself is the
              end of the page. */}
          <div style={{ height: SITE_CONFIG.sectionGap }} />
        </div>
      </main>
    </div>
  );
}
