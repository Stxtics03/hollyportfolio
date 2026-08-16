import { useCallback, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { BootSequence } from './components/boot/BootSequence';
import { SiteShell } from './components/site/SiteShell';
import { BlogPage } from './pages/BlogPage';
import { OnekoCat } from './components/pet/OnekoCat';
import { toExitPhase, type ExitPhase } from './lib/exitPhase';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const { pathname } = useLocation();

  /**
   * The loader is the site's front door, so it only plays on the front door.
   * Arriving at a shared `/blog` link and being held for 2.4s would be a toll,
   * not an introduction. It also plays once per session — see `useBootProgress`.
   */
  const [booting, setBooting] = useState(() => pathname === '/');

  const handleComplete = useCallback(() => setBooting(false), []);

  const handlePhaseChange = useCallback((phase: ExitPhase) => {
    // Deliberately unused for now. This is the seam SS-A's "evolving dark/light
    // mode" note hangs off: flip the theme here and it changes under the
    // loader, in time with the expansion, instead of after it.
    void phase;
  }, []);

  return (
    <>
      {/* The site is mounted the entire time the loader is up — that's what
          makes the reveal instant rather than a second page load. */}
      <Routes>
        <Route path="/" element={<SiteShell />} />
        <Route path="/blog" element={<BlogPage />} />
        {/* Anything else falls back to the index rather than a dead end. */}
        <Route path="*" element={<SiteShell />} />
      </Routes>

      {/* Site-wide, and only once the loader is gone: the boot sequence needs
          every frame it can get, and a cat wandering over the loading screen
          is not the first impression the front door is going for. */}
      {booting ? null : <OnekoCat />}

      {booting ? (
        // Forced dark regardless of the site's theme underneath — the loader
        // is always the dark composition — but it now takes the site's accent
        // rather than pinning one of its own.
        <div data-theme="dark" className="fixed inset-0 z-50">
          <BootSequence
            showTypeSpecimen={params.has('type')}
            debug={params.get('debug') === 'boot'}
            initialExitPhase={toExitPhase(params.get('exit'))}
            onComplete={handleComplete}
            onPhaseChange={handlePhaseChange}
          />
        </div>
      ) : null}
    </>
  );
}
