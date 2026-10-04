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
 * ScrollExpand owns the mask, the title lift and the pin (CSS sticky over a track
 * of 1 + scrollDistance + holdDistance viewports). This component adds:
 *
 *   - the video, scrubbed by scroll rather than played: after `loadedmetadata`,
 *     a scrubbed ScrollTrigger over the same track maps progress to currentTime
 *     with a short lead-in so the first frame holds through the opening;
 *   - the supporting copy, visible at rest in a sticky layer, easing out as the
 *     video takes the frame;
 *   - a static poster composition for reduced motion and for video failure.
 *
 * Desktop pins for 180vh (mask over the first 150vh, a 30vh hold). Phones pin for
 * 135vh. The scrub encodes carry a keyframe every six frames; see public/video.
 */
function HeroCopy() {
  return (
    <div className="nx-hero__copy">
      <p className="nx-hero__lede">
        Paid media, conversion, and the tracking between them. One system, built to move a business forward.
      </p>
      <div className="nx-hero__actions">
        <a className="nx-btn nx-btn--solid" href="#contact">
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
            scrub: 0.2,
            invalidateOnRefresh: true,
          },
          onUpdate() {
            // Hold the first frame through the opening 12%, then advance to the end.
            const t = duration * gsap.utils.clamp(0, 1, (proxy.p - 0.12) / 0.86);
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

  // Copy choreography over the pinned travel, and the opening sequence.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || isStatic || prefersReducedMotion()) return;

    const frame = root.querySelector<HTMLElement>('.scroll-expand__frame');
    const title = root.querySelector<HTMLElement>('.scroll-expand__title');
    const hint = root.querySelector<HTMLElement>('.scroll-expand__hint');
    const track = root.querySelector<HTMLElement>('.scroll-expand__track');
    const copy = root.querySelector<HTMLElement>('.nx-hero__copy');
    const meta = root.querySelector<HTMLElement>('.nx-hero__meta');
    const nav = document.querySelectorAll<HTMLElement>('.nx-nav__brand, .nx-nav__link, .nx-nav__cta');
    if (!frame || !title || !track || !copy) return;

    const ctx = gsap.context(() => {
      gsap.set(frame, { opacity: 0, scale: 0.94, transformOrigin: '50% 50%' });
      gsap.set(title, { clipPath: 'inset(0 0 100% 0)', translate: '0 0.22em' });
      if (hint) gsap.set(hint, { clipPath: 'inset(0 0 100% 0)' });
      gsap.set(copy, { opacity: 0, y: 14 });
      if (meta) gsap.set(meta, { opacity: 0, y: 12 });
      gsap.set(nav, { opacity: 0, y: -6 });
    }, root);

    let cancelled = false;

    const reveal = () => {
      ctx.add(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo(frame, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1.7, ease: 'power2.out' }, 0)
          .fromTo(
            title,
            { clipPath: 'inset(0 0 100% 0)', translate: '0 0.22em' },
            { clipPath: 'inset(0 0 -12% 0)', translate: '0 0', duration: 1.5, ease: 'power4.out' },
            0.45,
          )
          .to(nav, { opacity: 1, y: 0, duration: 0.9, stagger: 0.05 }, 0.3)
          .to(copy, { opacity: 1, y: 0, duration: 0.9 }, 1.05);
        if (meta) tl.to(meta, { opacity: 1, y: 0, duration: 0.8 }, 1.15);
        if (hint) tl.to(hint, { clipPath: 'inset(0 0 0% 0)', duration: 0.8 }, 1.25);
      });
    };

    // Scroll choreography for the copy. The mask, title and video follow the same track.
    const choreograph = async () => {
      await ensurePlugins();
      if (cancelled) return;
      ctx.add(() => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: 0.2, invalidateOnRefresh: true },
        });
        tl.to({}, { duration: 1 }, 0);
        tl.to(copy, { opacity: 0.72, duration: 0.4 }, 0.15);
        tl.to(copy, { opacity: 0, y: -14, duration: 0.23, ease: 'power1.in' }, 0.55);
        tl.set(copy, { pointerEvents: 'none' }, 0.78);
        if (meta) tl.to(meta, { opacity: 0, duration: 0.25 }, 0.15);
      });
    };

    fontsSettled().then(() => {
      if (!cancelled) reveal();
    });
    void choreograph();

    // A held page is a broken page. Release everything regardless of what fired.
    const failsafe = window.setTimeout(() => {
      ctx.add(() => {
        gsap.set([frame, title, hint, copy, meta, ...nav].filter(Boolean), { clearProps: 'opacity,transform,translate,clipPath,y' });
      });
    }, 4000);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      ctx.revert();
    };
  }, [isStatic]);

  if (isStatic) {
    return (
      <section ref={ref} id="top" className="nx-hero nx-hero--static" data-register="dark" aria-label="Nileaux. Flow Further.">
        <div className="nx-hero__still">
          <img src={poster} alt="Aerial view of a river delta at dusk, its channels catching the last light" />
          <div className="nx-hero__still-scrim" />
          <h1 className="nx-hero__still-title">Flow Further.</h1>
        </div>
        <div className="nx-hero__layer nx-hero__layer--static">
          <HeroCopy />
          <span className="nx-label nx-hero__meta">Paid media · Conversion · Analytics</span>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="top" className="nx-hero" data-register="dark" aria-label="Nileaux. Flow Further.">
      {/* Sticky copy layer: pinned with the stage, released with it. */}
      <div className="nx-hero__layer">
        <HeroCopy />
        <span className="nx-label nx-hero__meta" aria-hidden="true">Paid media · Conversion · Analytics</span>
      </div>

      <ScrollExpand
        className="nx-hero__expand"
        mediaType="video"
        src={src}
        poster={poster}
        title="Flow Further."
        scrollHint="Scroll"
        startWidth={compact ? 50 : 44}
        startHeight={compact ? 44 : 56}
        startRadius={22}
        endRadius={0}
        mediaZoom={1.18}
        scrollDistance={compact ? 1.1 : 1.5}
        holdDistance={compact ? 0.25 : 0.3}
        smoothing={0.04}
        overlayScrim={0.55}
        useWindowScroll
      />
    </section>
  );
}
