import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TERMINAL, type TerminalLine } from '../../data/terminal';

type Entry =
  | { kind: 'input'; text: string }
  | { kind: 'output'; line: TerminalLine };

const TONE_CLASS: Record<TerminalLine['tone'], string> = {
  out: 'text-bone/80',
  dim: 'text-bone/40',
  accent: 'text-acid',
};

/**
 * A small, real terminal.
 *
 * It genuinely parses what you type rather than replaying a script — which is
 * the whole point of putting one on a DevOps engineer's page. The command set
 * and every byte of output live in `data/terminal.ts`, so this component knows
 * how to run commands but nothing about what they say.
 */
export function Terminal() {
  const [entries, setEntries] = useState<Entry[]>(() =>
    TERMINAL.banner.map((line) => ({ kind: 'output', line })),
  );
  const [value, setValue] = useState('');
  /** Shell history, newest last, walked with the arrow keys. */
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fileNames = useMemo(() => Object.keys(TERMINAL.files), []);

  // Keep the newest line in view as output arrives.
  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [entries]);

  const print = useCallback((lines: readonly TerminalLine[]) => {
    setEntries((current) => [
      ...current,
      ...lines.map((line) => ({ kind: 'output' as const, line })),
    ]);
  }, []);

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      setEntries((current) => [...current, { kind: 'input', text: input }]);
      if (input.length === 0) return;

      setHistory((current) => [...current, input]);

      const [command, ...args] = input.split(/\s+/);

      switch (command) {
        case 'help':
          print(TERMINAL.commands.help);
          return;

        case 'whoami':
          print(TERMINAL.commands.whoami);
          return;

        case 'ls':
          print([
            ...TERMINAL.directories.map((dir) => ({ tone: 'accent' as const, text: dir })),
            ...fileNames.map((file) => ({ tone: 'out' as const, text: file })),
          ]);
          return;

        case 'stack':
          print(TERMINAL.files['stack.txt']);
          return;

        case 'cat': {
          const target = args[0];
          if (!target) {
            print([{ tone: 'dim', text: 'usage: cat FILE' }]);
            return;
          }
          if (TERMINAL.directories.includes(target)) {
            print([{ tone: 'dim', text: `cat: ${target}: is a directory` }]);
            return;
          }
          const file = TERMINAL.files[target];
          if (!file) {
            print([{ tone: 'dim', text: `cat: ${target}: no such file` }]);
            return;
          }
          print(file);
          return;
        }

        case 'clear':
          setEntries([]);
          return;

        default:
          print([
            { tone: 'dim', text: `${command}: command not found — try 'help'` },
          ]);
      }
    },
    [fileNames, print],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      run(value);
      setValue('');
      setHistoryIndex(null);
      return;
    }

    // Walk back through history, oldest-ward, the way a shell does.
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (history.length === 0) return;
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(history[next]);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(null);
        setValue('');
        return;
      }
      setHistoryIndex(next);
      setValue(history[next]);
    }
  };

  return (
    <div className="border-smoke bg-ink overflow-hidden rounded-2xl border">
      {/* Title bar. The lights are palette, not the usual red/amber/green —
          three foreign hues would undo the two-colour composition. */}
      <div className="border-smoke-soft flex items-center gap-2 border-b px-4 py-3">
        <span className="bg-bone/25 h-[9px] w-[9px] rounded-full" aria-hidden />
        <span className="bg-bone/40 h-[9px] w-[9px] rounded-full" aria-hidden />
        <span className="bg-acid h-[9px] w-[9px] rounded-full" aria-hidden />
        <span className="text-bone/35 tracking-label text-micro flex-1 text-center">
          {TERMINAL.title}
        </span>
        {/* Balances the lights so the title sits truly centred. */}
        <span className="w-[39px]" aria-hidden />
      </div>

      {/* Clicking anywhere in the body focuses the prompt, as a terminal does. */}
      <div
        ref={scrollRef}
        className="max-h-[260px] overflow-y-auto px-4 py-3"
        onClick={() => inputRef.current?.focus()}
      >
        <div aria-live="polite" className="flex flex-col gap-1">
          {entries.map((entry, index) =>
            entry.kind === 'input' ? (
              <p key={index} className="text-micro flex gap-2">
                <span className="text-acid shrink-0">{TERMINAL.prompt}</span>
                <span className="text-bone">{entry.text}</span>
              </p>
            ) : (
              <p key={index} className={`text-micro ${TONE_CLASS[entry.line.tone]}`}>
                {entry.line.text}
              </p>
            ),
          )}
        </div>

        <div className="text-micro mt-1 flex items-center gap-2">
          <label htmlFor="terminal-input" className="text-acid shrink-0">
            {TERMINAL.prompt}
          </label>
          <input
            id="terminal-input"
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input. Type help for commands."
            className="text-bone caret-acid min-w-0 flex-1 bg-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );
}
