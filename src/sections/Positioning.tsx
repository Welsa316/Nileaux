import { useCallback, useRef } from 'react';
import { useSectionMotion } from '../lib/sectionMotion';
import type { MotionApi } from '../lib/sectionMotion';
import './Positioning.css';

export default function Positioning() {
  const ref = useRef<HTMLElement>(null);

  const build = useCallback(({ root, maskedLines, revealBatch }: MotionApi) => {
    const statement = root.querySelector<HTMLElement>('.nx-pos__statement');
    if (statement) maskedLines(statement);
    revealBatch();
  }, []);

  useSectionMotion(ref, build);

  return (
    <section ref={ref} className="nx-pos" data-register="dark">
      <div className="nx-container nx-pos__grid">
        <div className="nx-pos__eyebrow">
          <span className="nx-label nx-reveal">01 — Position</span>
        </div>
        <h2 className="nx-pos__statement nx-lines">Traffic is only useful if the rest of the journey works.</h2>
        <div className="nx-pos__copy">
          <p className="nx-reveal">
            Most advertising is bought as if the click were the outcome. It is not. The page it lands on, the form it
            fills, the record it creates, the number someone reads next week: those are the outcome, and they are usually
            owned by nobody.
          </p>
          <p className="nx-reveal">Nileaux begins with paid media because that is where attention is bought. It does not end there.</p>
        </div>
      </div>
    </section>
  );
}
