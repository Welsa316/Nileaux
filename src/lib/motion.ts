import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Lenis from 'lenis';

let pluginsReady = false;

/** Register ScrollTrigger / SplitText lazily. ScrollTrigger touches matchMedia on
 *  register, which is unsafe at module scope in non-browser environments. */
export async function ensurePlugins() {
  if (pluginsReady || typeof window === 'undefined') return;
  const [{ ScrollTrigger }, { SplitText }] = await Promise.all([
    import('gsap/ScrollTrigger'),
    import('gsap/SplitText'),
  ]);
  gsap.registerPlugin(ScrollTrigger, SplitText);
  pluginsReady = true;
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Fonts ready, bounded so a stalled font request never holds a reveal. */
export function fontsSettled(timeoutMs = 900) {
  if (typeof document === 'undefined' || !('fonts' in document)) return Promise.resolve();
  return Promise.race([document.fonts.ready.then(() => undefined), new Promise<void>((r) => setTimeout(r, timeoutMs))]);
}

declare global {
  interface Window {
    __nxLenis?: Lenis;
  }
}

/** Inertia scroll under everything, driven by the GSAP ticker so ScrollTrigger and
 *  Lenis share one clock. Skipped under reduced motion. */
export function useSmoothScroll() {
  const ref = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    ref.current = lenis;
    window.__nxLenis = lenis;

    let st: typeof import('gsap/ScrollTrigger').ScrollTrigger | null = null;
    ensurePlugins().then(async () => {
      const mod = await import('gsap/ScrollTrigger');
      st = mod.ScrollTrigger;
      lenis.on('scroll', st.update);
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      if (st) lenis.off('scroll', st.update);
      lenis.destroy();
      ref.current = null;
      delete window.__nxLenis;
    };
  }, []);

  return ref;
}

/** Scroll to an in-page target through Lenis when it owns the scroll position. */
export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  const lenis = window.__nxLenis;
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.4 });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}
