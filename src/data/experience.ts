import type { TechRef } from './projects';

/**
 * Work history, newest first.
 *
 * Everything below the header is optional, and the card renders only what is
 * actually here — a role, a location, a stack and a list of info points each
 * appear when they are filled in and are left out entirely when they are not.
 * That is deliberate: an entry can be added the moment the dates are known,
 * without a placeholder standing in for something that has not been written
 * yet, and without anything being invented to fill the space.
 */

/** One bullet under `Info`: a bolded claim, then the detail behind it. */
export type InfoPoint = {
  /** The claim itself. Set in bone, bold. */
  lead: string;
  /** How it was done. Set dimmer, in the same sentence. */
  rest?: string;
};

export type Experience = {
  slug: string;
  company: string;
  /** Job title. Shown under the company, in the accent. */
  role?: string;
  /** One line on what the place is, above the stack and the bullets. */
  summary?: string;
  /** Free text so `PRESENT` is as easy to write as a month. */
  start: string;
  end: string;
  /** e.g. `Remote`, or `Kathmandu · Remote`. */
  location?: string;
  /** Makes the company name a link when present. */
  url?: string;
  /** A square image under `public/logos/`. Falls back to a monogram. */
  logo?: string;
  tech?: TechRef[];
  /** Rendered under the `Info` heading, one bullet each. */
  info?: InfoPoint[];
};

export const EXPERIENCE: Experience[] = [
  {
    slug: 'forge-labs',
    company: 'Forge Labs',
    role: 'Software Developer Engineer',
    start: 'JUL 2026',
    end: 'OCT 2026',
    location: 'Mumbai · Onsite',
    url: 'https://www.forgelabs.in/',
    // The lab's own mark, taken from `forgelabs.in/icon.svg`. Vector rather
    // than the PNG app icon beside it: it is 190 bytes and stays sharp when
    // the card's circle is drawn at 2x.
    logo: '/logos/forge-labs.svg',
    // The lab publishes its positioning and withholds its internals — "the
    // specifics stay inside the lab". So the copy below stays at the level the
    // company itself is public about: the IIT Bombay MoU, biomechanics, and
    // the human-in-the-loop model. No metrics are claimed, because none are
    // published and none should be invented here.
    summary:
      'Athlete performance lab working under an official MoU with IIT Bombay on AI-driven sports science and biomechanics.',
    info: [
      {
        lead: 'Developed the speed and camera synchronisation systems for cricket,',
        rest: 'the capture layer the lab’s ML calculations are computed from — a measurement is only as good as the timing it was taken with.',
      },
      {
        lead: 'Worked on the machine learning model behind those calculations,',
        rest: 'inside the lab’s human-in-the-loop approach — the machines measure, and every number passes a coach before it changes anyone’s training.',
      },
    ],
    // Stack still to come.
  },
];
