import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';
import type { SplitText as SplitTextType } from 'gsap/SplitText';
import { ensurePlugins, fontsSettled, prefersReducedMotion } from './motion';

export interface MotionApi {
  root: HTMLElement;
  ScrollTrigger: typeof ScrollTriggerType;
  SplitText: typeof SplitTextType;
  /** Masked line reveal for one statement. Tracks the split for the failsafe. */
  maskedLines: (el: HTMLElement, opts?: { start?: string; stagger?: number }) => void;
  /** Batch reveal for every `.nx-reveal` under root. */
  revealBatch: (opts?: { start?: string }) => void;
}

type Build = (api: MotionApi) => void;

const REVEAL = '.nx-reveal';
const LINES = '.nx-lines';

/**
 * One hook per section. Pre-hides reveal targets before paint, waits for plugins
 * and fonts, runs `build` inside a gsap.context, and releases everything after
 * 5s regardless of what fired. Reduced motion renders the section composed.
 */
export function useSectionMotion(ref: RefObject<HTMLElement>, build: Build) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;

    const reveals = root.querySelectorAll<HTMLElement>(REVEAL);
    const lines = root.querySelectorAll<HTMLElement>(LINES);
    const splits: { revert: () => void }[] = [];

    const ctx = gsap.context(() => {
      gsap.set(reveals, { opacity: 0, y: 24 });
      gsap.set(lines, { autoAlpha: 0 });
    }, root);

    let cancelled = false;

    Promise.all([ensurePlugins(), fontsSettled()]).then(async () => {
      if (cancelled) return;
      const [{ ScrollTrigger }, { SplitText }] = await Promise.all([import('gsap/ScrollTrigger'), import('gsap/SplitText')]);
      if (cancelled) return;

      ctx.add(() => {
        const maskedLines: MotionApi['maskedLines'] = (el, opts = {}) => {
          const split = SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit(self) {
              gsap.set(el, { autoAlpha: 1 });
              return gsap.fromTo(
                self.lines,
                { yPercent: 110 },
                {
                  yPercent: 0,
                  duration: 0.9,
                  ease: 'power4.out',
                  stagger: opts.stagger ?? 0.08,
                  scrollTrigger: { trigger: el, start: opts.start ?? 'top 82%', once: true },
                },
              );
            },
          });
          splits.push(split);
        };

        const revealBatch: MotionApi['revealBatch'] = (opts = {}) => {
          if (!reveals.length) return;
          ScrollTrigger.batch(reveals, {
            start: opts.start ?? 'top 88%',
            once: true,
            onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: 'auto' }),
          });
        };

        build({ root, ScrollTrigger, SplitText, maskedLines, revealBatch });
        ScrollTrigger.refresh();
      });
    });

    const failsafe = window.setTimeout(() => {
      ctx.add(() => {
        splits.splice(0).forEach((s) => s.revert());
        gsap.set([...reveals, ...lines], { clearProps: 'opacity,visibility,transform' });
      });
    }, 5000);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      splits.splice(0).forEach((s) => s.revert());
      ctx.revert();
    };
  }, [ref, build]);
}
