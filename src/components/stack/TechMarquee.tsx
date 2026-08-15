import { BRAND_MARKS } from './techIcons';
import { TECH_ROW_A, TECH_ROW_B, type TechItem } from '../../data/techStack';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type MarqueeTuning = {
  /** Seconds for the top row to travel one full cycle. */
  topSeconds: number;
  /** Bottom row. Deliberately different, so the two never sync up. */
  bottomSeconds: number;
  /** Width of the fade at each edge, in px. */
  fade: number;
};

function Item({ item }: { item: TechItem }) {
  const mark = BRAND_MARKS[item.slug];

  const content = (
    <>
      {mark ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="shrink-0"
          // Brand colour is always present in the markup; the row desaturates
          // it. That way "restore full colour" on hover is one filter change,
          // not a second set of assets.
          style={{ fill: `#${mark.hex}` }}
          aria-hidden
        >
          <path d={mark.path} />
        </svg>
      ) : null}
      <span className="text-bone/75 tracking-label text-body whitespace-nowrap uppercase">
        {item.name}
      </span>
    </>
  );

  const className =
    'flex items-center gap-3 px-6 transition-transform duration-200 hover:scale-110';

  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noreferrer noopener" className={`${className} focus-ring rounded-[4px]`}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

function Row({
  items,
  seconds,
  direction,
  still,
}: {
  items: TechItem[];
  seconds: number;
  direction: 'left' | 'right';
  still: boolean;
}) {
  // The list is rendered twice and the track travels exactly one copy's width,
  // so the wrap lands on an identical frame — no snap, no seam.
  const strip = [...items, ...items];

  return (
    <div className="marquee-row group relative overflow-hidden py-3">
      <div
        className="marquee-track flex w-max items-center"
        style={{
          animationName: direction === 'left' ? 'marquee-left' : 'marquee-right',
          animationDuration: `${seconds}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationPlayState: still ? 'paused' : undefined,
          willChange: 'transform',
        }}
      >
        {strip.map((item, index) => (
          <Item key={`${item.name}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}

/**
 * Two rows of the stack, travelling in opposite directions at speeds that
 * don't divide into each other, so they never fall into step.
 *
 * Everything is greyscale until you hover a row, which restores colour and
 * stops that row — the pause is what makes it feel like a thing you can
 * inspect rather than a thing that's playing at you.
 */
export function TechMarquee({ tuning }: { tuning: MarqueeTuning }) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      // Items dissolve at the edges instead of clipping against them.
      style={{
        WebkitMaskImage: `linear-gradient(to right, transparent, #000 ${tuning.fade}px, #000 calc(100% - ${tuning.fade}px), transparent)`,
        maskImage: `linear-gradient(to right, transparent, #000 ${tuning.fade}px, #000 calc(100% - ${tuning.fade}px), transparent)`,
      }}
    >
      <Row
        items={TECH_ROW_A}
        seconds={tuning.topSeconds}
        direction="right"
        still={reducedMotion}
      />
      <Row
        items={TECH_ROW_B}
        seconds={tuning.bottomSeconds}
        direction="left"
        still={reducedMotion}
      />
    </div>
  );
}
