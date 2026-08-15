import { useCallback, useState } from 'react';
import { BootSequence } from './components/boot/BootSequence';
import { SitePlaceholder } from './components/SitePlaceholder';
import { toExitPhase, type ExitPhase } from './lib/exitPhase';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const [booting, setBooting] = useState(true);

  const handleComplete = useCallback(() => setBooting(false), []);

  const handlePhaseChange = useCallback((phase: ExitPhase) => {
    // Deliberately unused for now. This is the seam SS1's "evolving dark/light
    // mode" note hangs off: flip the site's theme here and it changes under
    // the loader, in time with the expansion, instead of after it.
    void phase;
  }, []);

  return (
    <>
      {/* The site is mounted the entire time the loader is up — that's what
          makes the reveal instant rather than a second page load. */}
      <SitePlaceholder />

      {booting ? (
        <div className="fixed inset-0 z-50">
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
