import { BootSequence } from './components/boot/BootSequence';

/**
 * STAGE 1: the boot sequence is the whole app. Once the loader is finished
 * (stage 6), the real site mounts underneath it and `onComplete` unmounts this.
 */
export default function App() {
  const params = new URLSearchParams(window.location.search);

  return (
    <BootSequence
      showTypeSpecimen={params.has('type')}
      debug={params.get('debug') === 'boot'}
    />
  );
}
