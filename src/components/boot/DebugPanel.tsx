import type { BootPhase } from '../../hooks/useBootProgress';

type DebugPanelProps = {
  progress: number;
  percent: number;
  phase: BootPhase;
  onProgressChange: (next: number) => void;
};

/**
 * `?debug=boot` — pins progress to a slider so the bar, the phase labels and
 * the counter can be inspected at any value without reloading and waiting for
 * real assets.
 *
 * Debug mode also renders the whole tree under `MotionConfig isStatic`, so
 * every element sits at its final animated state. That makes the screen
 * inspectable in contexts where `requestAnimationFrame` never runs — a
 * backgrounded tab, a screenshot harness — where an entrance animation would
 * otherwise leave everything frozen at `opacity: 0`.
 *
 * STAGE 5 will add buttons here to scrub the exit transition.
 */
export function DebugPanel({ progress, percent, phase, onProgressChange }: DebugPanelProps) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex w-[280px] flex-col gap-3 rounded-2xl border border-smoke bg-ink-soft/95 p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-acid tracking-label text-micro uppercase">debug · boot</span>
        <span className="text-bone/45 tracking-label text-micro">{String(percent).padStart(3, '0')}%</span>
      </div>

      <input
        type="range"
        min={0}
        max={1000}
        value={Math.round(progress * 1000)}
        onChange={(event) => onProgressChange(Number(event.target.value) / 1000)}
        className="accent-acid w-full"
        aria-label="Boot progress"
      />

      <div className="flex items-center justify-between">
        <span className="text-bone/40 tracking-label text-micro uppercase">phase</span>
        <span className="text-bone/80 tracking-label text-micro uppercase">{phase}</span>
      </div>

      <p className="text-bone/30 tracking-body text-micro">
        Motion is frozen at its final state in debug mode.
      </p>
    </div>
  );
}
