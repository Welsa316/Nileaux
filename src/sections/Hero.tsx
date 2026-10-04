import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollExpand from '../components/ScrollExpand/ScrollExpand';
import { ensurePlugins, fontsSettled, prefersReducedMotion } from '../lib/motion';
import { useMediaQuery } from '../lib/useMediaQuery';
import './Hero.css';

const VIDEO_DESKTOP = '/video/delta-dusk-1080.mp4';
const VIDEO_MOBILE = '/video/delta-dusk-540.mp4';
const POSTER = '/video/delta-dusk-poster.jpg';
const POSTER_MOBILE = '/video/delta-dusk-poster-960.jpg';

/*
 * The hero is a cinematic opening: a framed still that comes alive as you scroll.
 * ScrollExpand owns the mask and the pin (CSS sticky over a track of
 * 1 + scrollDistance + holdDistance viewports). This component adds:
 *
 *   - the video, scrubbed by scroll rather than played: after `loadedmetadata`,
 *     a scrubbed ScrollTrigger over the same track maps progress to currentTime
 *     with a short lead-in so the first frame holds through the opening;
 *   - the type lockup in a sticky layer over the frame: the name arrives first,
 *     the headline rises through a mask beneath it, then the lede and the
 *     actions. On scroll the lockup lifts away as the video takes the frame;
 *   - a static poster composition for reduced motion and for video failure.
 *
 * Desktop pins for 320vh (mask over the first 260vh, a 60vh hold). Phones pin
 * for 220vh. The scrub encodes carry a keyframe every six frames; see public/video.
 */
function Lockup() {
  return (
    <div className="nx-hero__lockup">
      <span className="nx-hero__brand" aria-hidden="true">
        Nileaux
      </span>
      <h1 className="nx-hero__title">
        <span className="nx-hero__title-mask">
          <span className="nx-hero__title-line">Flow Further.</span>
        </span>
      </h1>
      <p className="nx-hero__lede">
        Paid media, conversion, and the tracking between them. One system, built to move a business forward.
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
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [videoFailed, setVideoFailed] = useState(false);
  const isStatic = reduced || videoFailed;
  const src = compact ? VIDEO_MOBILE : VIDEO_DESKTOP;
  const poster = compact ? POSTER_MOBILE : POSTER;

  // Video: never autoplays, never loops. Scroll is the transport.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || isStatic) return;
    const video = root.querySelector<HTMLVideoElement>('video.scroll-expand__media');
    const track = root.querySelector<HTMLElement>('.scroll-expand__track');
    if (!video || !track) return;

    // ScrollExpand renders the element with autoplay and loop; both are switched off
    // here before any media data arrives, so nothing ever plays on its own.
    video.autoplay = false;
    video.loop = false;
    video.preload = 'auto';
    video.pause();

    const ctx = gsap.context(() => {}, root);
    let cancelled = false;
    let lastTime = -1;

    const build = async () => {
      await ensurePlugins();
      if (cancelled) return;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (cancelled) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      ctx.add(() => {
        const proxy = { p: 0 };
        gsap.to(proxy, {
          p: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: track,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
            invalidateOnRefresh: true,
          },
          onUpdate() {
            // Hold the first frame through the opening 10%, then advance to the end by 97%.
            const t = duration * gsap.utils.clamp(0, 1, (proxy.p - 0.1) / 0.87);
            if (Math.abs(t - lastTime) < 1 / 60) return;
            lastTime = t;
            video.currentTime = t;
          },
        });
        ScrollTrigger.refresh();
      });
    };

    const onMeta = () => void build();
    const onError = () => setVideoFailed(true);
    if (video.readyState >= 1) void build();
    else video.addEventListener('loadedmetadata', onMeta, { once: true });
    video.addEventListener('error', onError);

    // iOS decodes seeked frames only after a gesture has touched the element once.
    const unlock = () => {
      const p = video.play();
      if (p && typeof p.then === 'function') p.then(() => video.pause()).catch(() => {});
      else video.pause();
    };
    window.addEventListener('touchstart', unlock, { once: true, passive: true });

    return () => {
      cancelled = true;
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('error', onError);
      window.removeEventListener('touchstart', unlock);
      ctx.revert();
    };
  }, [isStatic, src]);

  // The opening sequence, then the lockup's choreography over the pinned travel.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || isStatic || prefersReducedMotion()) return;

    const frame = root.querySelector<HTMLElement>('.scroll-expand__frame');
    const hint = root.querySelector<HTMLElement>('.scroll-expand__hint');
    const track = root.querySelector<HTMLElement>('.scroll-expand__track');
    const lockup = root.querySelector<HTMLElement>('.nx-hero__lockup');
    const brand = root.querySelector<HTMLElement>('.nx-hero__brand');
    const title = root.querySelector<HTMLElement>('.nx-hero__title');
    const titleLine = root.querySelector<HTMLElement>('.nx-hero__title-line');
    const lede = root.querySelector<HTMLElement>('.nx-hero__lede');
    const actions = root.querySelector<HTMLElement>('.nx-hero__actions');
    const nav = document.querySelectorAll<HTMLElement>('.nx-nav__brand, .nx-nav__link, .nx-nav__cta');
    if (!frame || !track || !lockup || !brand || !title || !titleLine || !lede || !actions) return;

    // Pre-hide before paint. The lede stays invisible until it has been split.
    const ctx = gsap.context(() => {
      gsap.set(frame, { opacity: 0, scale: 0.94, transformOrigin: '50% 50%' });
      gsap.set(brand, { opacity: 0, letterSpacing: '0.7em', y: 6 });
      gsap.set(titleLine, { yPercent: 112 });
      gsap.set(lede, { autoAlpha: 0 });
      gsap.set(actions, { opacity: 0, y: 14 });
      if (hint) gsap.set(hint, { clipPath: 'inset(0 0 100% 0)' });
      gsap.set(nav, { opacity: 0, y: -6 });
    }, root);

    let cancelled = false;
    let split: { revert: () => void } | null = null;

    const run = async () => {
      await Promise.all([ensurePlugins(), fontsSettled()]);
      if (cancelled) return;
      const { SplitText } = await import('gsap/SplitText');
      if (cancelled) return;

      ctx.add(() => {
        // The opening: frame, name, headline, lede, actions, cue. One slow moment.
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro
          .fromTo(frame, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out' }, 0)
          .to(nav, { opacity: 1, y: 0, duration: 0.9, stagger: 0.05 }, 0.3)
          .to(brand, { opacity: 1, letterSpacing: '0.34em', y: 0, duration: 1.4, ease: 'power2.out' }, 0.5)
          .to(titleLine, { yPercent: 0, duration: 1.3, ease: 'power4.out' }, 1.15);

        // The lede's masked lines are revealed by the intro, not by a delayed tween
        // inside onSplit: a re-split (resize, late font) during the opening would
        // otherwise rebuild that tween and could show the lines early.
        let ledeRevealed = false;
        let ledeTween: gsap.core.Tween | null = null;
        split = SplitText.create(lede, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit(self) {
            if (ledeRevealed) {
              gsap.set(self.lines, { yPercent: 0 });
              return undefined;
            }
            ledeTween = gsap.fromTo(self.lines, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.08, paused: true });
            return ledeTween;
          },
        });
        intro.call(
          () => {
            ledeRevealed = true;
            gsap.set(lede, { autoAlpha: 1 });
            ledeTween?.play();
          },
          [],
          1.85,
        );

        intro.to(actions, { opacity: 1, y: 0, duration: 0.9 }, 2.25);
        if (hint) intro.to(hint, { clipPath: 'inset(0 0 0% 0)', duration: 0.8 }, 2.5);

        // Scroll: the supporting copy steps back first, then the name and the
        // headline lift away as the frame opens to full bleed.
        const scroll = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: 0.3, invalidateOnRefresh: true },
        });
        scroll
          .to({}, { duration: 1 }, 0)
          .to([lede, actions], { opacity: 0.72, duration: 0.2 }, 0.1)
          .to([lede, actions], { opacity: 0, y: -18, duration: 0.2, ease: 'power1.in' }, 0.3)
          .set(actions, { pointerEvents: 'none' }, 0.5)
          .to([brand, title], { opacity: 0, y: -36, duration: 0.28, ease: 'power1.in', stagger: 0.04 }, 0.42)
          .to(lockup, { scale: 1.04, duration: 0.3, ease: 'power1.in' }, 0.42);
      });
    };
    void run();

    // A held page is a broken page. Release everything regardless of what fired.
    const failsafe = window.setTimeout(() => {
      ctx.add(() => {
        split?.revert();
        split = null;
        gsap.set([frame, brand, titleLine, lede, actions, hint, ...nav].filter(Boolean), {
          clearProps: 'opacity,visibility,transform,translate,clipPath,letterSpacing,y',
        });
      });
    }, 5000);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      split?.revert();
      ctx.revert();
    };
  }, [isStatic]);

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
      {/* Sticky type layer: pinned with the stage, released with it. */}
      <div className="nx-hero__layer">
        <Lockup />
      </div>

      <ScrollExpand
        className="nx-hero__expand"
        mediaType="video"
        src={src}
        poster={poster}
        scrollHint="Scroll"
        startWidth={compact ? 50 : 44}
        startHeight={compact ? 44 : 56}
        startRadius={22}
        endRadius={0}
        mediaZoom={1.18}
        scrollDistance={compact ? 1.8 : 2.6}
        holdDistance={compact ? 0.4 : 0.6}
        smoothing={0.04}
        overlayScrim={0.55}
        useWindowScroll
      />
    </section>
  );
}
