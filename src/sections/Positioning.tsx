import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ensurePlugins, fontsSettled, prefersReducedMotion } from '../lib/motion';
import './Positioning.css';

export default function Positioning() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;

    const statement = root.querySelector<HTMLElement>('.nx-pos__statement');
    const copy = root.querySelectorAll<HTMLElement>('.nx-pos__copy > *');
    if (!statement) return;

    // Pre-hide before paint so there is no flash of composed content.
    const ctx = gsap.context(() => {
      gsap.set(statement, { autoAlpha: 0 });
      gsap.set(copy, { opacity: 0, y: 24 });
    }, root);

    let cancelled = false;
    let split: { revert: () => void } | null = null;
    let failsafe = 0;

    Promise.all([ensurePlugins(), fontsSettled()]).then(async () => {
      if (cancelled) return;
      const { SplitText } = await import('gsap/SplitText');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (cancelled) return;

      ctx.add(() => {
        split = SplitText.create(statement, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit(self) {
            gsap.set(statement, { autoAlpha: 1 });
            return gsap.fromTo(
              self.lines,
              { yPercent: 110 },
              {
                yPercent: 0,
                duration: 0.9,
                ease: 'power4.out',
                stagger: 0.08,
                scrollTrigger: { trigger: statement, start: 'top 82%', once: true },
              },
            );
          },
        });

        gsap.to(copy, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: root.querySelector('.nx-pos__copy'), start: 'top 88%', once: true },
        });

        ScrollTrigger.refresh();
      });
    });

    // Failsafe: anything still parked behind a mask after 5s is shown plainly.
    // The split is reverted too, otherwise the lines stay translated inside
    // their clipped wrappers and the statement is invisible for good.
    failsafe = window.setTimeout(() => {
      ctx.add(() => {
        split?.revert();
        split = null;
        gsap.set([statement, ...copy], { clearProps: 'opacity,visibility,transform' });
      });
    }, 5000);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      split?.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={ref} id="services" className="nx-pos">
      <div className="nx-container nx-pos__grid">
        <div className="nx-pos__eyebrow">
          <span className="nx-label">01 — Position</span>
        </div>
        <h2 className="nx-pos__statement">Traffic is only useful if the rest of the journey works.</h2>
        <div className="nx-pos__copy">
          <p>
            Most advertising is bought as if the click were the outcome. It is not. The page it lands on, the form it
            fills, the record it creates, the number someone reads next week: those are the outcome, and they are usually
            owned by nobody.
          </p>
          <p>Nileaux begins with paid media because that is where attention is bought. It does not end there.</p>
        </div>
      </div>
    </section>
  );
}
