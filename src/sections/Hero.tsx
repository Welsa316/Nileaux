import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollExpand from '../components/ScrollExpand/ScrollExpand';
import { fontsSettled, prefersReducedMotion } from '../lib/motion';
import './Hero.css';

const HERO_SRC = '/images/delta-dusk-2560.avif';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;

    const frame = root.querySelector<HTMLElement>('.scroll-expand__frame');
    const title = root.querySelector<HTMLElement>('.scroll-expand__title');
    const hint = root.querySelector<HTMLElement>('.scroll-expand__hint');
    const meta = root.querySelectorAll<HTMLElement>('.nx-hero__meta > *');
    const nav = document.querySelectorAll<HTMLElement>('.nx-nav__brand, .nx-nav__link, .nx-nav__cta');
    if (!frame || !title) return;

    // The component owns opacity/transform on the title and hint through inline
    // styles, so the intro drives clip-path and the individual `translate`
    // property instead. Nothing here is overwritten by the scroll handler.
    const ctx = gsap.context(() => {
      gsap.set(frame, { opacity: 0, scale: 0.94, transformOrigin: '50% 50%' });
      gsap.set(title, { clipPath: 'inset(0 0 100% 0)', translate: '0 0.22em' });
      if (hint) gsap.set(hint, { clipPath: 'inset(0 0 100% 0)' });
      gsap.set(meta, { opacity: 0, y: 12 });
      gsap.set(nav, { opacity: 0, y: -6 });
    }, root);

    let cancelled = false;
    let failsafe = 0;

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
          .to(meta, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 1.05);
        if (hint) tl.to(hint, { clipPath: 'inset(0 0 0% 0)', duration: 0.8 }, 1.25);
      });
    };

    fontsSettled().then(() => {
      if (!cancelled) reveal();
    });

    // A held page is a broken page. Release everything regardless of what fired.
    failsafe = window.setTimeout(() => {
      ctx.add(() => {
        gsap.set([frame, title, hint, ...meta, ...nav], { clearProps: 'opacity,transform,translate,clipPath,y' });
      });
    }, 4000);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={ref} id="top" className="nx-hero" aria-label="Nileaux. Flow Further.">
      <ScrollExpand
        className="nx-hero__expand"
        src={HERO_SRC}
        alt="Aerial view of tidal channels braiding across a delta at dusk"
        title="Flow Further."
        scrollHint="Scroll"
        startWidth={44}
        startHeight={56}
        startRadius={22}
        endRadius={0}
        mediaZoom={1.3}
        scrollDistance={1.3}
        holdDistance={0.5}
        smoothing={0.05}
        overlayScrim={0.55}
        useWindowScroll
      >
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
      </ScrollExpand>

      <div className="nx-hero__meta" aria-hidden="true">
        <span className="nx-label">Growth company</span>
        <span className="nx-label nx-hero__meta-right">Paid media · Conversion · Analytics</span>
      </div>
    </section>
  );
}
