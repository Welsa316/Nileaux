import { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { useSectionMotion } from '../lib/sectionMotion';
import type { MotionApi } from '../lib/sectionMotion';
import './System.css';

const NODES = [
  { label: 'Traffic', sub: 'Search and social' },
  { label: 'Landing experience', sub: 'The page the click deserves' },
  { label: 'Tracking', sub: 'Every event, attributed' },
  { label: 'Lead flow', sub: 'Into the pipeline, not a spreadsheet' },
  { label: 'Analytics', sub: 'Numbers someone reads' },
  { label: 'Optimisation', sub: 'Budget moves to what works' },
];

// Desktop: a long, low meander across the width. Phone: the same idea, vertical.
const WIDE = { vb: '0 0 1200 400', main: 'M 0 300 C 180 300 220 110 400 118 S 620 300 800 290 S 1020 120 1200 130', ghost: 'M 0 330 C 200 332 230 150 420 160 S 630 330 820 322 S 1030 150 1200 165' };
const TALL = { vb: '0 0 120 900', main: 'M 24 0 C 24 160 96 200 96 320 S 24 480 24 600 S 96 760 96 900', ghost: 'M 44 0 C 44 170 110 210 110 330 S 46 490 46 610 S 110 770 110 900' };

export default function System() {
  const ref = useRef<HTMLElement>(null);

  const build = useCallback(({ root, ScrollTrigger, maskedLines, revealBatch }: MotionApi) => {
    const statement = root.querySelector<HTMLElement>('.nx-sys__statement');
    if (statement) maskedLines(statement);
    revealBatch();

    const field = root.querySelector<HTMLElement>('.nx-sys__field');
    const nodes = root.querySelectorAll<HTMLElement>('.nx-sys__node');
    if (!field || !nodes.length) return;

    const activeSvg = () => [...root.querySelectorAll<SVGSVGElement>('.nx-sys__svg')].find((s) => getComputedStyle(s).display !== 'none');

    // Place each node on the visible path. Re-run whenever ScrollTrigger refreshes
    // (resize, orientation change), since the path geometry changes with layout.
    const place = () => {
      const svg = activeSvg();
      const path = svg?.querySelector<SVGPathElement>('.nx-sys__path--main');
      if (!svg || !path) return;
      const tall = svg.classList.contains('nx-sys__svg--tall');
      const vw = svg.viewBox.baseVal.width || 1200;
      const vh = svg.viewBox.baseVal.height || 400;
      const len = path.getTotalLength();
      const fieldW = field.clientWidth;

      nodes.forEach((node, i) => {
        const t = (i + 0.5) / nodes.length;
        const p = path.getPointAtLength(len * t);
        node.style.left = `${(p.x / vw) * 100}%`;
        node.style.top = `${(p.y / vh) * 100}%`;

        const text = node.querySelector<HTMLElement>('.nx-sys__text');
        if (!text) return;

        if (tall) {
          // Phone: every label sits in one column to the right of the line.
          node.dataset.side = 'right';
          text.style.left = `${fieldW - (p.x / vw) * fieldW + 28}px`;
          return;
        }

        // Desktop: the label goes on the side the line is moving away from, so
        // it never crosses the path. The last node opens to the left.
        text.style.left = '';
        const ahead = path.getPointAtLength(Math.min(len, len * t + 30));
        const descending = ahead.y > p.y;
        const left = i === nodes.length - 1;
        const above = left ? !descending : descending;
        node.dataset.side = `${above ? 'above' : 'below'}-${left ? 'left' : 'right'}`;
      });
    };
    place();
    ScrollTrigger.addEventListener('refreshInit', place);

    const paths = root.querySelectorAll<SVGPathElement>('.nx-sys__path');
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: field, start: 'top 72%', end: 'bottom 55%', scrub: 1, invalidateOnRefresh: true },
    });
    paths.forEach((p) => tl.to(p, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0));
    nodes.forEach((node, i) => {
      const t = (i + 0.5) / nodes.length;
      tl.fromTo(node, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, Math.max(0, t - 0.06));
    });

    return () => ScrollTrigger.removeEventListener('refreshInit', place);
  }, []);

  useSectionMotion(ref, build);

  return (
    <section ref={ref} id="system" className="nx-sys" data-register="dark">
      <div className="nx-container">
        <div className="nx-sys__head">
          <span className="nx-label nx-reveal">03 — The system</span>
          <h2 className="nx-sys__statement nx-lines">Advertising is only one part of the system.</h2>
          <p className="nx-sys__lede nx-reveal">
            Every stage hands off to the next. A campaign is only as strong as the weakest handoff, so Nileaux owns all of
            them.
          </p>
        </div>

        <div className="nx-sys__field" aria-label="The Nileaux growth system: traffic, landing experience, tracking, lead flow, analytics, optimisation">
          <svg className="nx-sys__svg nx-sys__svg--wide" viewBox={WIDE.vb} preserveAspectRatio="none" aria-hidden="true">
            <path className="nx-sys__path nx-sys__path--ghost" d={WIDE.ghost} />
            <path className="nx-sys__path nx-sys__path--main" d={WIDE.main} />
          </svg>
          <svg className="nx-sys__svg nx-sys__svg--tall" viewBox={TALL.vb} preserveAspectRatio="none" aria-hidden="true">
            <path className="nx-sys__path nx-sys__path--ghost" d={TALL.ghost} />
            <path className="nx-sys__path nx-sys__path--main" d={TALL.main} />
          </svg>

          <ol className="nx-sys__nodes">
            {NODES.map((n, i) => (
              <li key={n.label} className="nx-sys__node">
                <span className="nx-sys__dot" aria-hidden="true" />
                <span className="nx-sys__text">
                  <span className="nx-sys__index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="nx-sys__label">{n.label}</span>
                  <span className="nx-sys__sub">{n.sub}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
