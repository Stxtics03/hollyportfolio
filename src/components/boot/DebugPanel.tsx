import type { BootPhase } from '../../hooks/useBootProgress';
import { EXIT_PHASES, type ExitPhase } from '../../lib/exitPhase';

type DebugPanelProps = {
  progress: number;
  percent: number;
  phase: BootPhase;
  exitPhase: ExitPhase;
  onProgressChange: (next: number) => void;
  onExitPhaseChange: (next: ExitPhase) => void;
};

/**
 * `?debug=boot` — pins progress to a slider and the exit to a button, so any
 * state of the screen can be inspected without reloading and waiting for real
 * assets to resolve.
 *
 * Debug mode also renders the whole tree under `MotionConfig isStatic`, so
 * every element sits at its final animated state. That makes the screen
 * inspectable where `requestAnimationFrame` never runs — a backgrounded tab, a
 * screenshot harness — which an entrance animation would otherwise leave
 * frozen at `opacity: 0`. It also means these buttons *jump* between exit
 * states rather than playing the transition between them; to watch the real
 * choreography, drop the `debug` param and let the timeline run.
 */
export function DebugPanel({
  progress,
  percent,
  phase,
  exitPhase,
  onProgressChange,
  onExitPhaseChange,
}: DebugPanelProps) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex w-[300px] flex-col gap-3 rounded-2xl border border-smoke bg-ink-soft/95 p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-acid tracking-label text-micro uppercase">debug · boot</span>
        <span className="text-bone/45 tracking-label text-micro">
          {String(percent).padStart(3, '0')}%
        </span>
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

      <div className="flex flex-col gap-2 border-t border-smoke pt-3">
        <span className="text-bone/40 tracking-label text-micro uppercase">exit</span>
        <div className="flex flex-wrap gap-1">
          {EXIT_PHASES.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onExitPhaseChange(step)}
              className={`tracking-label text-micro rounded-[6px] border px-2 py-1 uppercase transition-colors ${
                exitPhase === step
                  ? 'border-acid bg-acid text-ink'
                  : 'border-smoke text-bone/55 hover:text-bone'
              }`}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      <p className="text-bone/30 tracking-body text-micro">
        Buttons play the real transition. &amp;exit=&lt;phase&gt; pins one beat on load.
      </p>
    </div>
  );
}
