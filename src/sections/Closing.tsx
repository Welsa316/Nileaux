import { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { useSectionMotion } from '../lib/sectionMotion';
import type { MotionApi } from '../lib/sectionMotion';
import './Closing.css';

const CONTACT_EMAIL = 'hello@nileaux.com';

export default function Closing() {
  const ref = useRef<HTMLElement>(null);

  const build = useCallback(({ root, maskedLines, revealBatch }: MotionApi) => {
    const statement = root.querySelector<HTMLElement>('.nx-close__statement');
    const title = root.querySelector<HTMLElement>('.nx-close__title');
    const img = root.querySelector<HTMLElement>('.nx-close__img');
    if (title) maskedLines(title, { start: 'top 78%' });
    if (statement) maskedLines(statement, { start: 'top 85%', stagger: 0.06 });
    revealBatch();

    // The delta returns underneath the closing statement, settling as you arrive.
    if (img) {
      gsap.fromTo(
        img,
        { scale: 1.12, yPercent: -4 },
        { scale: 1, yPercent: 4, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    }
  }, []);

  useSectionMotion(ref, build);

  return (
    <section ref={ref} id="contact" className="nx-close" data-register="dark">
      <div className="nx-close__media" aria-hidden="true">
        <picture>
          <source srcSet="/images/delta-dusk-1672.avif" type="image/avif" />
          <img className="nx-close__img" src="/images/delta-dusk-1672.jpg" alt="" loading="lazy" decoding="async" />
        </picture>
        <div className="nx-close__scrim" />
      </div>

      <div className="nx-container nx-close__inner">
        <h2 className="nx-close__title nx-lines">Flow Further.</h2>
        <p className="nx-close__statement nx-lines">Your next stage of growth should feel intentional.</p>
        <div className="nx-close__actions nx-reveal">
          <a className="nx-btn nx-btn--solid" href={`mailto:${CONTACT_EMAIL}`}>
            Start a conversation
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a className="nx-link nx-close__email" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>

      <footer className="nx-footer">
        <div className="nx-container nx-footer__inner">
          <span className="nx-wordmark" role="img" aria-label="Nileaux">NILEΛUX</span>
          <span className="nx-footer__services nx-label">Google Ads · Meta Ads · Conversion · Lead tracking</span>
          <span className="nx-footer__legal nx-label">© 2026 Nileaux</span>
        </div>
      </footer>
    </section>
  );
}
