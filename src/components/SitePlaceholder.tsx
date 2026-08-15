/**
 * Stand-in for the real portfolio.
 *
 * It exists so the handoff can be proved: the site is mounted *underneath* the
 * loader the whole time, so when the loader unmounts there is nothing to wait
 * for — no flash of empty page, no second load. Replace this whole component
 * with the actual site; nothing else in the boot sequence needs to change.
 */
export function SitePlaceholder() {
  return (
    <main className="flex min-h-[100dvh] w-full flex-col justify-center gap-6 px-8 md:px-16">
      <p className="text-acid tracking-ticker text-micro uppercase">Main app · mounted</p>
      <h1 className="text-bone tracking-heading text-title md:text-display-sm lg:text-display">
        Shrestha Chandra
      </h1>
      <p className="text-bone/60 tracking-body text-body max-w-[560px]">
        This is where the portfolio goes. The boot sequence has already handed off — it unmounted
        the moment its timeline finished, and this was underneath it all along.
      </p>
    </main>
  );
}
