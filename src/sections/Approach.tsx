import { useCallback, useRef } from 'react';
import { useSectionMotion } from '../lib/sectionMotion';
import type { MotionApi } from '../lib/sectionMotion';
import './Approach.css';

const STEPS = [
  { title: 'Measure', copy: 'Baseline before budget. If it cannot be tracked, it is not bought.' },
  { title: 'Test', copy: 'Audiences, offers, pages. Small bets, read honestly.' },
  { title: 'Refine', copy: 'Cut what does not move the number. Lean into what does.' },
  { title: 'Scale', copy: 'Spend follows evidence, in the order it earns it.' },
];

export default function Approach() {
  const ref = useRef<HTMLElement>(null);

  const build = useCallback(({ root, maskedLines, revealBatch }: MotionApi) => {
    const statement = root.querySelector<HTMLElement>('.nx-app__statement');
    if (statement) maskedLines(statement);
    revealBatch();
  }, []);

  useSectionMotion(ref, build);

  return (
    <section ref={ref} id="approach" className="nx-app" data-register="light">
      <div className="nx-container">
        <div className="nx-app__head">
          <span className="nx-label nx-reveal">04 — Approach</span>
          <h2 className="nx-app__statement nx-lines">Strategy before spend.</h2>
          <div className="nx-app__aside">
            <p className="nx-app__signal nx-reveal">Less noise. More signal.</p>
            <p className="nx-app__lede nx-reveal">
              Every account runs the same loop, continuously. Nothing is set and forgotten, and nothing is scaled before
              it has earned it.
            </p>
          </div>
        </div>

        <ol className="nx-app__steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="nx-app__step nx-reveal">
              <span className="nx-app__num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="nx-app__title">{s.title}</h3>
              <p className="nx-app__copy">{s.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
