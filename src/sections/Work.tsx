import { useCallback, useRef } from 'react';
import { useSectionMotion } from '../lib/sectionMotion';
import type { MotionApi } from '../lib/sectionMotion';
import './Work.css';

// Structure for future case studies. Nothing here is a real result: every slot is
// an explicit placeholder until a client has approved real numbers.
const SLOTS = [
  { index: '01', metrics: ['Cost per lead', 'Conversion rate', 'Return on ad spend'] },
  { index: '02', metrics: ['Cost per lead', 'Lead quality', 'Payback period'] },
  { index: '03', metrics: ['Impression share', 'Conversion rate', 'Return on ad spend'] },
];

export default function Work() {
  const ref = useRef<HTMLElement>(null);

  const build = useCallback(({ root, maskedLines, revealBatch }: MotionApi) => {
    const statement = root.querySelector<HTMLElement>('.nx-work__statement');
    if (statement) maskedLines(statement);
    revealBatch();
  }, []);

  useSectionMotion(ref, build);

  return (
    <section ref={ref} id="work" className="nx-work" data-register="light">
      <div className="nx-container">
        <div className="nx-work__head">
          <span className="nx-label nx-reveal">05 — Selected work</span>
          <h2 className="nx-work__statement nx-lines">Proof, when it is ready.</h2>
          <p className="nx-work__lede nx-reveal">
            Case studies are published with client approval and real numbers, or not at all. The first ones are in
            preparation.
          </p>
        </div>

        <ol className="nx-work__list">
          {SLOTS.map((s) => (
            <li key={s.index} className="nx-work__row nx-reveal">
              <span className="nx-work__index">{s.index}</span>
              <div className="nx-work__title">
                <span className="nx-work__client">Case study in preparation</span>
                <span className="nx-work__status nx-label">Pending client approval</span>
              </div>
              <dl className="nx-work__metrics">
                {s.metrics.map((m) => (
                  <div key={m} className="nx-work__metric">
                    <dt className="nx-label">{m}</dt>
                    <dd aria-label="Not yet published">—</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
