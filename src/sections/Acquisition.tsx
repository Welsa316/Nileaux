import { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { useSectionMotion } from '../lib/sectionMotion';
import type { MotionApi } from '../lib/sectionMotion';
import './Acquisition.css';

const ITEMS = [
  {
    word: 'Search',
    channel: 'Google Ads',
    copy: 'Demand that already exists, met at the moment of intent. Keyword by keyword, with the budget following the queries that convert.',
  },
  {
    word: 'Social',
    channel: 'Meta Ads',
    copy: 'Demand that does not exist yet, created with precise audiences and creative that is tested rather than guessed.',
  },
  {
    word: 'Conversion',
    channel: 'Landing pages and offers',
    copy: 'The page, the offer, the form. Where paid attention either becomes a measurable outcome or quietly leaks away.',
  },
];

export default function Acquisition() {
  const ref = useRef<HTMLElement>(null);

  const build = useCallback(({ root, revealBatch }: MotionApi) => {
    revealBatch();

    const track = root.querySelector<HTMLElement>('.nx-acq__track');
    const words = root.querySelectorAll<HTMLElement>('.nx-acq__word');
    const copies = root.querySelectorAll<HTMLElement>('.nx-acq__copy');
    const rule = root.querySelector<HTMLElement>('.nx-acq__rule-fill');
    if (!track || words.length < 3) return;

    const ink = getComputedStyle(root).getPropertyValue('--nx-ink').trim() || '#071522';
    const faint = 'rgba(7, 21, 34, 0.16)';

    // Desktop only: pinned, scrubbed sequence. Phones get the plain stacked layout.
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      gsap.set(words, { color: faint });
      gsap.set(words[0], { color: ink });
      gsap.set(copies, { autoAlpha: 0, y: 14 });
      gsap.set(copies[0], { autoAlpha: 1, y: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true },
      });

      for (let i = 1; i < words.length; i++) {
        const at = i;
        tl.to(words[i - 1], { color: faint, duration: 0.45, ease: 'power2.inOut' }, at - 0.25)
          .to(copies[i - 1], { autoAlpha: 0, y: -14, duration: 0.3, ease: 'power2.in' }, at - 0.3)
          .to(words[i], { color: ink, duration: 0.45, ease: 'power2.inOut' }, at - 0.25)
          .fromTo(copies[i], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, at + 0.05);
      }
      tl.to({}, { duration: 0.7 });

      if (rule) gsap.fromTo(rule, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: true } });
    });

    return () => mm.revert();
  }, []);

  useSectionMotion(ref, build);

  return (
    <section ref={ref} id="services" className="nx-acq" data-register="light">
      <div className="nx-acq__track">
        <div className="nx-acq__stage">
          <div className="nx-container nx-acq__inner">
            <header className="nx-acq__head">
              <span className="nx-label nx-reveal">02 — Paid acquisition</span>
              <p className="nx-acq__intro nx-reveal">Google Ads and Meta Ads, run as one program with one number to answer to.</p>
              <div className="nx-acq__rule" aria-hidden="true">
                <span className="nx-acq__rule-fill" />
              </div>
            </header>

            <div className="nx-acq__grid">
              {ITEMS.map((item, i) => (
                <div key={item.word} className="nx-acq__pair" style={{ ['--i' as string]: i }}>
                  <p className="nx-acq__word" data-index={String(i + 1).padStart(2, '0')}>
                    {item.word}
                  </p>
                  <div className="nx-acq__copy">
                    <span className="nx-label nx-acq__channel">{item.channel}</span>
                    <p>{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
