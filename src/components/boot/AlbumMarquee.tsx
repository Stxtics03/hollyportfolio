import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import type { Album } from '../../data/albums';

export type MarqueeTuning = {
  /** Seconds for one cover to cross the panel. ~2.5s is the brief. */
  secondsPerCover: number;
  /** Vertical gap between covers, in px. */
  gap: number;
  /**
   * Cover size as a fraction of the panel's height, capped by its width.
   * This is what decides how many covers are on screen at once: at ~0.55 you
   * get the centre cover plus a slice of the one above and below, which is
   * what makes the scale/dim treatment legible. Size them to the panel's
   * width instead and only one is ever visible, so nothing reads as a
   * neighbour.
   */
  coverHeightRatio: number;
  /** Scale of the covers either side of centre. */
  neighbourScale: number;
  /** Opacity of the covers either side of centre. */
  neighbourOpacity: number;
  /** Saturation of the covers either side of centre, 0–1. */
  neighbourSaturation: number;
};

type AlbumMarqueeProps = {
  albums: Album[];
  tuning: MarqueeTuning;
  /** Freeze the scroll and centre the list. */
  still?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

type CoverProps = {
  album: Album;
  index: number;
  pitch: number;
  size: number;
  panelHeight: number;
  scroll: MotionValue<number>;
  tuning: MarqueeTuning;
};

/**
 * One cover. Its scale/opacity/saturation are derived from the shared scroll
 * value analytically — `useTransform` on a motion value, never a
 * `getBoundingClientRect` in a frame loop. Nothing here reads layout, so the
 * marquee can't thrash it.
 */
function Cover({ album, index, pitch, size, panelHeight, scroll, tuning }: CoverProps) {
  /** Distance of this cover's centre from the panel's centre, in px. */
  const distance = useTransform(scroll, (y) => {
    const centre = index * pitch + size / 2 + y;
    return Math.abs(centre - panelHeight / 2);
  });

  /** 1 at the centre line, 0 once a full pitch away. */
  const proximity = useTransform(distance, (d) => Math.max(0, 1 - d / pitch));

  const scale = useTransform(
    proximity,
    [0, 1],
    [tuning.neighbourScale, 1],
  );
  const opacity = useTransform(proximity, [0, 1], [tuning.neighbourOpacity, 1]);
  const filter = useTransform(
    proximity,
    (p) => `saturate(${(tuning.neighbourSaturation + (1 - tuning.neighbourSaturation) * p).toFixed(3)})`,
  );

  return (
    <motion.img
      src={album.cover}
      alt=""
      aria-hidden
      draggable={false}
      className="absolute left-1/2 rounded-[10px]"
      style={{
        top: index * pitch,
        width: size,
        height: size,
        x: '-50%',
        scale,
        opacity,
        filter,
        // Covers overlap slightly at the edges of the pitch; a hairline keeps
        // them from merging into one column.
        boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
      }}
    />
  );
}

/**
 * Vertical album marquee.
 *
 * The list is rendered twice and the whole strip is translated upward by
 * exactly one list-height before wrapping, so the loop has no seam. Motion is
 * driven by a single motion value advanced in `useAnimationFrame`, rather than
 * a keyframe animation, because every cover's scale has to be a function of
 * that same value — one source of truth, one composited transform each.
 */
export function AlbumMarquee({
  albums,
  tuning,
  still = false,
  className = '',
  style,
}: AlbumMarqueeProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const scroll = useMotionValue(0);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const measure = () => {
      const rect = panel.getBoundingClientRect();
      setBox({ width: rect.width, height: rect.height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  // Covers are square, inset from the panel's sides, and sized off its height
  // so more than one is ever visible.
  const size = Math.max(Math.min(box.width - 24, box.height * tuning.coverHeightRatio), 0);
  const pitch = size + tuning.gap;
  const listHeight = pitch * albums.length;

  useAnimationFrame((_, delta) => {
    if (still || listHeight === 0) return;
    const perSecond = pitch / tuning.secondsPerCover;
    let next = scroll.get() - (perSecond * delta) / 1000;
    // Wrap by exactly one list height — the duplicated copy is already there.
    if (next <= -listHeight) next += listHeight;
    scroll.set(next);
  });

  // Park the list so a cover sits on the centre line when frozen.
  useEffect(() => {
    if (still && listHeight > 0) {
      scroll.set(box.height / 2 - size / 2 - pitch);
    }
  }, [still, listHeight, box.height, size, pitch, scroll]);

  // Two copies: the strip only ever travels one list-height before wrapping.
  const strip = [...albums, ...albums];

  return (
    <div
      ref={panelRef}
      className={`relative overflow-hidden rounded-2xl border border-smoke-soft bg-ink ${className}`}
      style={{
        ...style,
        // Covers dissolve into the panel rather than clipping at its edges.
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)',
        maskImage:
          'linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)',
      }}
    >
      {size > 0 ? (
        <motion.div className="absolute inset-0" style={{ y: scroll }}>
          {strip.map((album, index) => (
            <Cover
              key={`${album.title}-${index}`}
              album={album}
              index={index}
              pitch={pitch}
              size={size}
              panelHeight={box.height}
              scroll={scroll}
              tuning={tuning}
            />
          ))}
        </motion.div>
      ) : null}
    </div>
  );
}
