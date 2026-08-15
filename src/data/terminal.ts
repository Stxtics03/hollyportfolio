/**
 * The terminal's contents. Every command's output lives here, so adding one is
 * a data edit rather than a component change.
 */

export type TerminalLine = {
  /** `out` is plain output, `dim` is secondary, `accent` is acid. */
  tone: 'out' | 'dim' | 'accent';
  text: string;
};

export const TERMINAL = {
  /** Shown in the title bar. */
  title: '~/stx',
  /** The bit before the `$` on every prompt line. */
  prompt: 'shrestha@portfolio:~$',

  /** Printed once when the terminal mounts. */
  banner: [
    { tone: 'out', text: 'stx.sh v1.0' },
    { tone: 'dim', text: 'type ls or help to get started' },
  ] as TerminalLine[],

  /** Files `ls` lists and `cat` can read. */
  files: {
    'about.md': [
      { tone: 'out', text: 'Backend-leaning DevOps engineer.' },
      { tone: 'dim', text: 'Pipelines, infrastructure, and the glue nobody sees.' },
    ],
    'stack.txt': [
      { tone: 'out', text: 'docker · kubernetes · terraform · aws' },
      { tone: 'out', text: 'go · python · typescript · bash' },
      { tone: 'dim', text: 'and a great deal of yaml' },
    ],
    'contact.txt': [
      { tone: 'out', text: 'github.com/Stxtics03' },
      { tone: 'dim', text: 'the rest is in the links panel' },
    ],
  } as Record<string, TerminalLine[]>,

  /** Directories are listed but not readable — `cat projects/` should fail. */
  directories: ['projects/'] as readonly string[],

  commands: {
    help: [
      { tone: 'dim', text: 'available commands' },
      { tone: 'out', text: 'whoami    who is typing this' },
      { tone: 'out', text: 'ls        list files' },
      { tone: 'out', text: 'cat FILE  read a file' },
      { tone: 'out', text: 'stack     what I build with' },
      { tone: 'out', text: 'clear     wipe the screen' },
    ] as TerminalLine[],

    whoami: [
      { tone: 'out', text: 'Shrestha Chandra / aka stxtics03' },
      {
        tone: 'dim',
        text: 'devops engineer, backend leaning, occasional breaker of staging',
      },
    ] as TerminalLine[],
  },
} as const;
