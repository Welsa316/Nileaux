import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import ScrollExpand from '../components/ScrollExpand/ScrollExpand';
import { fontsSettled, prefersReducedMotion } from '../lib/motion';
import { useMediaQuery } from '../lib/useMediaQuery';
import './Hero.css';

const VIDEO = {
  uhd: '/video/delta-dusk-2160.mp4',
  qhd: '/video/delta-dusk-1440.mp4',
  fhd: '/video/delta-dusk-1080.mp4',
  mobile: '/video/delta-dusk-540.mp4',
};
const POSTER = {
  wide: '/video/delta-dusk-poster-2560.jpg',
  standard: '/video/delta-dusk-poster.jpg',
  mobile: '/video/delta-dusk-poster-960.jpg',
};

/** The film takes at least this long to run end to end, however fast the scroll. */
const MIN_SECONDS = 5;
/** Touch flicks clear a section in a second; the cap is shorter there so the type is seen. */
const MIN_SECONDS_TOUCH = 2.5;

/*
 * The hero is a cinematic opening: a framed still that comes alive as you scroll.
 * ScrollExpand owns the mask and the pin (CSS sticky over a track of
 * 1 + scrollDistance + holdDistance viewports). This component adds:
 *
 *   - the type lockup, rendered through a portal into the component's own sticky
 *     stage so it is pinned and released by exactly the same box as the frame;
 *   - a rate-limited progress driver. Raw scroll progress over the track is the
 *     target; a smoothed value follows it at no more than 1 / MIN_SECONDS per
 *     second and sets the video's currentTime, so a slow scroll is one to one
 *     and a fast flick still plays the film out over at least MIN_SECONDS. The
 *     type follows the same value but with a floor tied to raw scroll, so it is
 *     always fully written by the time the scroll reaches the end of the travel:
 *     nobody can flick past the hero without seeing the name. The video never
 *     autoplays or loops; scroll is the transport;
 *   - a static poster composition for reduced motion and for video failure.
 *
 * Desktop pins for 320vh (mask over the first 260vh, a 60vh hold). Phones pin
 * for 280vh and bring the type in earlier. Sources are chosen by device pixels: 4K on dense screens from
 * 1100 CSS px, 1440p on dense screens below that or very wide standard screens,
 * 1080p otherwise, 540p on phones. All carry a keyframe every six frames.
 */
function Lockup() {
  return (
    <div className="nx-hero__lockup">
      <span className="nx-hero__brand" aria-hidden="true">
        NILEΛUX
      </span>
      <h1 className="nx-hero__title">
        <span className="nx-sr-only">Nileaux. </span>
        <span className="nx-hero__title-mask">
          <span className="nx-hero__title-line">Flow Further.</span>
        </span>
      </h1>
      <p className="nx-hero__lede">
        <span className="nx-hero__lede-mask">
          <span className="nx-hero__lede-line">
            Paid media, conversion, and the tracking between them. One system, built to move a business forward.
          </span>
        </span>
      </p>
      <div className="nx-hero__actions">
        <a className="nx-btn nx-btn--rose" href="#contact">
          Start a conversation
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a className="nx-link nx-hero__secondary" href="#services">
          What we do
        </a>
      </div>
    </div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const compact = useMediaQuery('(max-width: 640px)');
  const touch = useMediaQuery('(pointer: coarse)');
  const dense = useMediaQuery('(min-resolution: 1.5dppx)');
  const wide = useMediaQuery('(min-width: 1100px)');
  const veryWide = useMediaQuery('(min-width: 1500px)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [videoFailed, setVideoFailed] = useState(false);
  const [stage, setStage] = useState<HTMLElement | null>(null);
  const isStatic = reduced || videoFailed;

  const src = compact ? VIDEO.mobile : dense && wide ? VIDEO.uhd : dense || veryWide ? VIDEO.qhd : VIDEO.fhd;
  const poster = compact ? POSTER.mobile : dense && wide ? POSTER.wide : POSTER.standard;

  // The portal target: the component's sticky stage.
  useLayoutEffect(() => {
    const root = ref.current;
    setStage(root && !isStatic ? root.querySelector<HTMLElement>('.scroll-expand__stage') : null);
  }, [isStatic]);

  // Video setup, the opening, and the rate-limited driver for film and type.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || isStatic || !stage) return;

    const video = root.querySelector<HTMLVideoElement>('video.scroll-expand__media');
    const track = root.querySelector<HTMLElement>('.scroll-expand__track');
    const frame = root.querySelector<HTMLElement>('.scroll-expand__frame');
    const media = root.querySelector<HTMLElement>('.scroll-expand__media');
    const hint = root.querySelector<HTMLElement>('.scroll-expand__hint');
    const brand = stage.querySelector<HTMLElement>('.nx-hero__brand');
    const titleLine = stage.querySelector<HTMLElement>('.nx-hero__title-line');
    const ledeLine = stage.querySelector<HTMLElement>('.nx-hero__lede-line');
    const actions = stage.querySelector<HTMLElement>('.nx-hero__actions');
    const nav = document.querySelectorAll<HTMLElement>('.nx-nav__brand, .nx-nav__link, .nx-nav__cta');
    if (!video || !track || !frame || !brand || !titleLine || !ledeLine || !actions) return;

    // ScrollExpand renders the element with autoplay and loop; both are switched off
    // here before any media data arrives, so nothing ever plays on its own.
    video.autoplay = false;
    video.loop = false;
    video.preload = 'auto';
    video.pause();

    const motion = !prefersReducedMotion();
    const minSeconds = touch ? MIN_SECONDS_TOUCH : MIN_SECONDS;
    const trackingRest = compact ? '0.3em' : '0.42em';
    const trackingWide = compact ? '0.5em' : '0.62em';
    let cancelled = false;
    let lastTime = -1;

    // Pre-hide before paint. Nothing but the frame is visible at rest. The media is
    // shifted down through the independent `translate` property (the component owns
    // `transform`) so the braid in the upper third of the shot sits in the resting frame.
    const ctx = gsap.context(() => {
      gsap.set(frame, { opacity: 0, scale: 0.94, transformOrigin: '50% 50%' });
      if (media) gsap.set(media, { translate: '0 10%' });
      gsap.set(brand, { opacity: 0, letterSpacing: trackingWide, y: 10 });
      gsap.set(titleLine, { yPercent: 112 });
      gsap.set(ledeLine, { yPercent: 110 });
      gsap.set(actions, { opacity: 0, y: 14, pointerEvents: 'none' });
      if (hint) gsap.set(hint, { clipPath: 'inset(0 0 100% 0)' });
      gsap.set(nav, { opacity: 0, y: -6 });
    }, root);

    // The type timeline is paused and driven by progress, not by a ScrollTrigger.
    // Fractions are of the pinned travel. The mask is full at ~81%.
    let typeTl: gsap.core.Timeline | null = null;
    ctx.add(() => {
      typeTl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
      typeTl.to({}, { duration: 1 }, 0);
      if (media) typeTl.to(media, { translate: '0 0%', duration: 0.8 }, 0);
      const at = compact ? { brand: 0.14, title: 0.34, lede: 0.5, actions: 0.62 } : { brand: 0.24, title: 0.5, lede: 0.7, actions: 0.82 };
      typeTl
        .to(brand, { opacity: 1, letterSpacing: trackingRest, y: 0, duration: 0.2, ease: 'power2.out' }, at.brand)
        .to(titleLine, { yPercent: 0, duration: 0.16, ease: 'power3.out' }, at.title)
        .to(ledeLine, { yPercent: 0, duration: 0.14, ease: 'power3.out' }, at.lede)
        .to(actions, { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, at.actions)
        .set(actions, { pointerEvents: 'auto' }, at.actions + 0.04);
    });

    // Raw scroll progress over the track, the same geometry the component uses.
    const readTarget = () => {
      const span = track.offsetHeight - window.innerHeight;
      if (span <= 0) return 0;
      return gsap.utils.clamp(0, 1, -track.getBoundingClientRect().top / span);
    };

    // The type's floor: by 92% of the raw travel it is complete, however fast the pass.
    const typeFloor = (target: number) => gsap.utils.clamp(0, 1, (target - 0.5) / 0.42);

    const apply = (p: number, target: number) => {
      typeTl?.progress(Math.max(p, typeFloor(target)));
      const duration = video.duration;
      if (video.readyState >= 1 && Number.isFinite(duration) && duration > 0) {
        // Hold the first frame through the opening 10%, then advance to the end by 97%.
        const t = duration * gsap.utils.clamp(0, 1, (p - 0.1) / 0.87);
        if (Math.abs(t - lastTime) >= 1 / 60) {
          lastTime = t;
          video.currentTime = t;
        }
      }
    };

    // Rate-limited follower: at most 1 / MIN_SECONDS of the travel per second.
    let smooth = readTarget();
    let lastTarget = smooth;
    let last = performance.now();
    apply(smooth, lastTarget);
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const target = readTarget();
      const maxStep = motion ? dt / minSeconds : 1;
      const delta = gsap.utils.clamp(-maxStep, maxStep, target - smooth);
      if (delta === 0 && target === lastTarget) return;
      smooth += delta;
      lastTarget = target;
      apply(smooth, target);
    };
    gsap.ticker.add(tick);

    const onMeta = () => apply(smooth, lastTarget);
    const onError = () => setVideoFailed(true);
    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('error', onError);

    // iOS decodes seeked frames only after a gesture has touched the element once.
    const unlock = () => {
      const p = video.play();
      if (p && typeof p.then === 'function') p.then(() => video.pause()).catch(() => {});
      else video.pause();
    };
    window.addEventListener('touchstart', unlock, { once: true, passive: true });

    // Opening: the frame settles, the chrome arrives. The river has the screen.
    fontsSettled().then(() => {
      if (cancelled) return;
      ctx.add(() => {
        if (!motion) {
          gsap.set([frame, hint, ...nav].filter(Boolean), { clearProps: 'opacity,transform,clipPath,y' });
          return;
        }
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro
          .fromTo(frame, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out' }, 0)
          .to(nav, { opacity: 1, y: 0, duration: 0.9, stagger: 0.05 }, 0.3);
        if (hint) intro.to(hint, { clipPath: 'inset(0 0 0% 0)', duration: 0.8 }, 1.2);
      });
    });

    // A held page is a broken page. Release the frame and chrome regardless.
    const failsafe = window.setTimeout(() => {
      ctx.add(() => gsap.set([frame, hint, ...nav].filter(Boolean), { clearProps: 'opacity,transform,clipPath,y' }));
    }, 4000);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      gsap.ticker.remove(tick);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('error', onError);
      window.removeEventListener('touchstart', unlock);
      ctx.revert();
    };
  }, [isStatic, src, stage, compact, touch]);

  if (isStatic) {
    return (
      <section ref={ref} id="top" className="nx-hero nx-hero--static" data-register="dark" aria-label="Nileaux. Flow Further.">
        <div className="nx-hero__still">
          <img src={poster} alt="Aerial view of a river delta at dusk, its channels catching the last light" />
          <div className="nx-hero__still-scrim" />
        </div>
        <div className="nx-hero__layer nx-hero__layer--static">
          <Lockup />
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="top" className="nx-hero" data-register="dark" aria-label="Nileaux. Flow Further.">
      <ScrollExpand
        className="nx-hero__expand"
        mediaType="video"
        src={src}
        poster={poster}
        scrollHint="Scroll"
        startWidth={compact ? 52 : 48}
        startHeight={compact ? 46 : 60}
        startRadius={22}
        endRadius={0}
        mediaZoom={1.08}
        scrollDistance={compact ? 2.2 : 2.6}
        holdDistance={compact ? 0.6 : 0.6}
        smoothing={0.35}
        overlayScrim={0.55}
        useWindowScroll
      />
      {/* The type lives inside the component's sticky stage, pinned by the same box as the frame. */}
      {stage
        ? createPortal(
            <div className="nx-hero__layer">
              <Lockup />
            </div>,
            stage,
          )
        : null}
    </section>
  );
}
