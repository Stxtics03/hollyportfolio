import { useEffect, useRef } from 'react';
import { denHome, denVisible } from './CatDen';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * The cursor cat.
 *
 * Ported from `D:\Program\Portfolio-latest` (`src/components/OnekoCat.jsx`),
 * which is itself the long-lived `oneko` desktop pet. Every number and every
 * sprite coordinate below is carried over unchanged, so it looks and behaves
 * exactly as it does there: same 15px stride, same ten steps a second, same
 * 48px personal space, same idle repertoire.
 *
 * The one thing rewritten is *how* it runs. The original keeps the cat's
 * position, the pointer, the frame counter and the idle state in React state,
 * with all of them in the effect's dependency array — so ten times a second it
 * tore down and re-registered both listeners and the animation frame, and
 * re-rendered the tree, to move a 32px sprite. Here that state lives in the
 * loop's closure and the sprite is moved by writing to the element directly:
 * the effect runs once, and the cat costs one rAF callback and two style
 * writes per tick, with no React render at all.
 */

/**
 * Frames into `oneko.gif`, in sprite units — the sheet is 8×4 tiles of 32px,
 * and these are multiplied up at draw time. Several entries hold two frames
 * and alternate between them, which is what gives the walk its bob.
 */
const SPRITE_SETS: Record<string, ReadonlyArray<readonly [number, number]>> = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [
    [-5, 0],
    [-6, 0],
    [-7, 0],
  ],
  scratchWallN: [
    [0, 0],
    [0, -1],
  ],
  scratchWallS: [
    [-7, -1],
    [-6, -2],
  ],
  scratchWallE: [
    [-2, -2],
    [-2, -3],
  ],
  scratchWallW: [
    [-4, 0],
    [-4, -1],
  ],
  tired: [[-3, -2]],
  sleeping: [
    [-2, 0],
    [-2, -1],
  ],
  N: [
    [-1, -2],
    [-1, -3],
  ],
  NE: [
    [0, -2],
    [0, -3],
  ],
  E: [
    [-3, 0],
    [-3, -1],
  ],
  SE: [
    [-5, -1],
    [-5, -2],
  ],
  S: [
    [-6, -3],
    [-7, -2],
  ],
  SW: [
    [-5, -3],
    [-6, -1],
  ],
  W: [
    [-4, -2],
    [-4, -3],
  ],
  NW: [
    [-1, 0],
    [-1, -1],
  ],
};

/** Pixels travelled per step. */
const SPEED = 15;
/** Milliseconds between steps — the cat's whole clock, walk and idle alike. */
const TICK_MS = 100;
/** Side of one sprite in the sheet. */
const SPRITE = 32;
/** Inside this, the cat stops chasing the cursor and settles. */
const REST_DISTANCE = 48;
/**
 * The same, for the den — much tighter. The cursor gets personal space; a bed
 * does not. At 48px the cat would stop wherever it first came within half a
 * card's width of home and sit down beside its own house.
 */
const HOME_REST = 4;
/** Closest the cat comes to a viewport edge. */
const EDGE_MARGIN = 16;
/** Below this width it starts on the right, clear of the header's links. */
const MOBILE_WIDTH = 768;
/**
 * How long the pointer must sit still before the cat gives up on it and walks
 * home to the den. Long enough that reading a paragraph does not send it away,
 * short enough that leaving the tab open ends with a cat in its box.
 */
const HOME_AFTER_MS = 7000;

export function OnekoCat() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // A sprite that chases the pointer is exactly what "reduce motion" is
    // asking about, so it does not run at all — and because the hook is live,
    // turning the preference off starts it without a reload.
    if (reducedMotion) return;

    const neko = ref.current;
    if (!neko) return;

    // Starts in the den when there is one, so the first thing you see is a cat
    // at home rather than a sprite parked in the corner.
    let home = denVisible() ? denHome() : { x: 32, y: 32 };
    let nekoX = denVisible() ? home.x : window.innerWidth <= MOBILE_WIDTH ? window.innerWidth - 64 : 32;
    let nekoY = denVisible() ? home.y : 32;
    // Starts under its own feet, so it holds still until the pointer moves.
    let mouseX = nekoX;
    let mouseY = nekoY;
    /** When the pointer last moved — what decides whether the cat goes home. */
    let lastPointerAt = performance.now();
    /** True while walking back to the den rather than chasing the cursor. */
    let headingHome = false;

    let frameCount = 0;
    let idleTime = 0;
    let idleAnimation: string | null = null;
    let idleAnimationFrame = 0;
    let lastFrame = 0;
    let raf = 0;

    const setSprite = (name: string, frame: number) => {
      const set = SPRITE_SETS[name] ?? SPRITE_SETS.idle;
      const [x, y] = set[frame % set.length];
      neko.style.backgroundPosition = `${x * SPRITE}px ${y * SPRITE}px`;
    };

    const place = () => {
      neko.style.left = `${nekoX - SPRITE / 2}px`;
      neko.style.top = `${nekoY - SPRITE / 2}px`;
    };

    const resetIdleAnimation = () => {
      idleAnimation = null;
      idleAnimationFrame = 0;
    };

    /** What it does once it has caught up: mostly nothing, occasionally a bit. */
    const idle = () => {
      idleTime += 1;

      // Home and settled: curl up rather than waiting on the dice below. A cat
      // that walked all the way back to its box and then stood in the doorway
      // would look like it had forgotten why it went.
      if (headingHome && !idleAnimation && idleTime > 4) {
        idleAnimation = 'sleeping';
      }

      // Roughly a 1-in-200 chance per tick once it has been still a second.
      if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && !idleAnimation) {
        const available = ['sleeping', 'scratchSelf'];
        if (nekoX < 32) available.push('scratchWallW');
        if (nekoY < 32) available.push('scratchWallN');
        if (nekoX > window.innerWidth - 32) available.push('scratchWallE');
        if (nekoY > window.innerHeight - 32) available.push('scratchWallS');
        idleAnimation = available[Math.floor(Math.random() * available.length)];
      }

      switch (idleAnimation) {
        case 'sleeping':
          // Yawns for eight ticks before it actually falls asleep.
          if (idleAnimationFrame < 8) {
            setSprite('tired', 0);
            break;
          }
          setSprite('sleeping', Math.floor(idleAnimationFrame / 4));
          if (idleAnimationFrame > 192) resetIdleAnimation();
          break;
        case 'scratchWallN':
        case 'scratchWallS':
        case 'scratchWallE':
        case 'scratchWallW':
        case 'scratchSelf':
          setSprite(idleAnimation, idleAnimationFrame);
          if (idleAnimationFrame > 9) resetIdleAnimation();
          break;
        default:
          setSprite('idle', 0);
          return;
      }

      idleAnimationFrame += 1;
    };

    const step = () => {
      frameCount += 1;

      // Chase the pointer while it is being used; head for the den once it has
      // been abandoned. The den is the target, not a special mode — everything
      // below (walk sprites, the alert pause, the idle animations) works the
      // same either way.
      headingHome = denVisible() && performance.now() - lastPointerAt > HOME_AFTER_MS;
      const targetX = headingHome ? home.x : mouseX;
      const targetY = headingHome ? home.y : mouseY;

      const diffX = nekoX - targetX;
      const diffY = nekoY - targetY;
      const distance = Math.hypot(diffX, diffY);

      const rest = headingHome ? HOME_REST : REST_DISTANCE;
      if (distance < rest) {
        idle();
        return;
      }

      resetIdleAnimation();

      // Woken from a rest: sits up and looks for a tick before giving chase.
      if (idleTime > 1) {
        setSprite('alert', 0);
        idleTime = Math.max(idleTime - 1, 0);
        return;
      }

      let direction = '';
      direction += diffY / distance > 0.5 ? 'N' : '';
      direction += diffY / distance < -0.5 ? 'S' : '';
      direction += diffX / distance > 0.5 ? 'W' : '';
      direction += diffX / distance < -0.5 ? 'E' : '';
      setSprite(direction, frameCount);

      // Never overshoot: on the last step home the stride is whatever is left,
      // so the cat lands in the doorway rather than oscillating past it. For
      // the cursor this changes nothing — it stops 48px out, long before the
      // remaining distance is shorter than one stride.
      const stride = Math.min(SPEED, distance);
      nekoX -= (diffX / distance) * stride;
      nekoY -= (diffY / distance) * stride;
      nekoX = Math.min(Math.max(EDGE_MARGIN, nekoX), window.innerWidth - EDGE_MARGIN);
      nekoY = Math.min(Math.max(EDGE_MARGIN, nekoY), window.innerHeight - EDGE_MARGIN);
      place();
    };

    const onPointerMove = (event: PointerEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      lastPointerAt = performance.now();
    };

    const onResize = () => {
      // The den is only drawn from `lg`, so crossing that width changes where
      // home is — or whether there is one.
      home = denVisible() ? denHome() : { x: 32, y: 32 };
      // Keep it on screen when the window shrinks under it.
      nekoX = Math.min(Math.max(EDGE_MARGIN, nekoX), window.innerWidth - EDGE_MARGIN);
      nekoY = Math.min(Math.max(EDGE_MARGIN, nekoY), window.innerHeight - EDGE_MARGIN);
      place();
    };

    const animate = (timestamp: number) => {
      if (!lastFrame) lastFrame = timestamp;
      if (timestamp - lastFrame > TICK_MS) {
        lastFrame = timestamp;
        step();
      }
      raf = requestAnimationFrame(animate);
    };

    place();
    setSprite('idle', 0);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={ref}
      data-oneko-cat="true"
      aria-hidden
      style={{
        width: SPRITE,
        height: SPRITE,
        position: 'fixed',
        left: 32,
        top: 32,
        pointerEvents: 'none',
        imageRendering: 'pixelated',
        backgroundImage: 'url(/oneko.gif)',
        // Above the header, deliberately below the boot loader's overlay — the
        // original pins itself to the top of the stacking order, which would
        // have put a cat on top of the loading screen.
        zIndex: 45,
      }}
    />
  );
}
