/**
 * Typography specimen — visit `/?type` to see it.
 *
 * The whole site runs on one face (Departure Mono), so hierarchy has to be
 * carried by size, weight, color and spacing alone. This page is the contract:
 * every tier below is a token in `tailwind.config.ts`, and nothing on the site
 * should invent a tier that isn't here. Delete it once the scale settles.
 *
 * Sizes are integer px, always. Tailwind's default scale has been replaced,
 * not extended — `text-lg` (18px) and `text-3xl` (30px) don't exist here,
 * because a bitmap glyph off the pixel grid is a blurred glyph.
 */

const TIERS = [
  {
    name: 'hero',
    note: '96px / 92px · tracking-heading · acid',
    className: 'text-acid pixel-bold tracking-heading text-title md:text-display lg:text-hero',
    sample: 'SHRESTHA.EXE',
  },
  {
    name: 'display',
    note: '64px / 64px · bone',
    className: 'text-bone tracking-heading text-sub md:text-display-sm lg:text-display',
    sample: 'WELCOME TO',
  },
  {
    name: 'title',
    note: '32px / 40px · tracking-heading · bone',
    className: 'text-bone tracking-heading text-title',
    sample: 'Selected Work',
  },
  {
    name: 'sub',
    note: '24px / 40px · bone/80',
    className: 'text-bone/80 tracking-heading text-sub',
    sample: 'Case Study 01',
  },
  {
    name: 'body',
    note: '16px / 28px · tracking-body · bone/70',
    className: 'text-bone/70 tracking-body text-body max-w-[640px]',
    sample:
      'Bitmap type needs more air than a normal sans, so body copy runs at 28px line-height with 0.05em of tracking. Read a paragraph of it before deciding the site is too loud — the rhythm only shows up at length.',
  },
  {
    name: 'micro / label',
    note: '12px / 20px · tracking-label · uppercase · acid',
    className: 'text-acid tracking-label text-micro uppercase',
    sample: 'Initializing',
  },
  {
    name: 'micro / ticker',
    note: '12px / 20px · tracking-ticker · uppercase · bone/40',
    className: 'text-bone/40 tracking-ticker text-micro uppercase',
    sample: 'Available for work',
  },
] as const;

export function TypeSpecimen() {
  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-12 px-6 py-20">
      <header className="flex flex-col gap-2">
        <p className="text-acid tracking-ticker text-micro uppercase">
          Departure Mono · one face, seven tiers
        </p>
        <p className="text-bone/50 tracking-body text-body">
          Hierarchy comes from size, weight, color and spacing — never from a second typeface.
          Every size on this page is an integer: 12 / 16 / 20 / 24 / 32 / 48 / 64 / 96.
        </p>
      </header>

      {TIERS.map((tier) => (
        <section key={tier.name} className="flex flex-col gap-3 border-t border-smoke pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-bone/70 tracking-label text-micro uppercase">{tier.name}</span>
            <span className="text-bone/30 tracking-body text-micro">{tier.note}</span>
          </div>
          <p className={tier.className}>{tier.sample}</p>
        </section>
      ))}

      <section className="flex flex-col gap-3 border-t border-smoke pt-6">
        <span className="text-bone/70 tracking-label text-micro uppercase">
          weight · single-cut family
        </span>
        <div className="flex flex-wrap items-baseline gap-8">
          <p className="text-bone tracking-heading text-sub">REGULAR 400</p>
          <p className="text-bone pixel-bold tracking-heading text-sub">PIXEL-BOLD</p>
          <p className="text-bone crisp-type tracking-heading text-sub">CRISP-TYPE</p>
        </div>
        <p className="text-bone/40 tracking-body text-body max-w-[640px]">
          Departure Mono ships one weight. `font-synthesis: none` blocks the browser&apos;s faked
          bold (it smears a bitmap face), so the bolder tier is `.pixel-bold` — a 1px horizontal
          smear of the glyph against itself, the way bitmap type has always been emboldened.
          `.crisp-type` turns antialiasing off entirely for hard pixel edges.
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-smoke pt-6">
        <span className="text-bone/70 tracking-label text-micro uppercase">glyph coverage</span>
        <p className="text-bone/80 tracking-body text-lead break-words">
          ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
          !?@#$%&amp;*()[]{}&lt;&gt;/\|+-=_~^ ←→↑↓ ░▒▓█
        </p>
      </section>
    </div>
  );
}
