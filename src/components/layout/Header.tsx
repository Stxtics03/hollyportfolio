import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { NAV_LINKS, WORDMARK } from '../../data/site';

/**
 * Sticky header: transparent over the page, with a `smoke` hairline that only
 * appears once you've scrolled off the top. Backdrop blur throughout so type
 * passing underneath never fights the nav.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const onHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass =
    'text-bone/60 hover:text-bone tracking-label text-micro focus-ring group relative rounded-[4px] uppercase transition-colors';

  /** Underline grows from the left rather than fading in. */
  const underline = (
    <span
      aria-hidden
      className="bg-acid absolute -bottom-1 left-0 h-px w-0 transition-[width] duration-300 group-hover:w-full"
    />
  );

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 backdrop-blur-md transition-colors duration-300"
      style={{
        backgroundColor: scrolled ? 'rgb(var(--color-ink) / 0.72)' : 'transparent',
        borderBottom: `1px solid ${scrolled ? 'var(--smoke)' : 'transparent'}`,
      }}
    >
      <div className="mx-auto flex h-14 w-full max-w-[640px] items-center justify-between px-6">
        <Link
          to="/"
          className="text-bone tracking-label text-micro focus-ring rounded-[4px] uppercase"
        >
          {WORDMARK}
        </Link>

        <nav aria-label="Sections" className="flex items-center gap-5">
          {/* Owns its own theme state on purpose — see ThemeToggle. */}
          <ThemeToggle />

          <ul className="flex items-center gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                {link.isRoute ? (
                  <Link to={link.href} className={linkClass}>
                    {link.label}
                    {underline}
                  </Link>
                ) : (
                  // Anchors resolve against home, so they still work when
                  // clicked from another route — the router handles the jump
                  // to `/` and the hash lands once the page is there.
                  <a href={onHome ? link.href : `/${link.href}`} className={linkClass}>
                    {link.label}
                    {underline}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
