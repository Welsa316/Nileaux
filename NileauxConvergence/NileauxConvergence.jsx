import React, { useEffect, useId, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import SearchGlyph from './glyphs/SearchGlyph.jsx';
import SocialGlyph from './glyphs/SocialGlyph.jsx';
import WebGlyph from './glyphs/WebGlyph.jsx';
import AnalyticsGlyph from './glyphs/AnalyticsGlyph.jsx';
import ConversionGlyph from './glyphs/ConversionGlyph.jsx';
import CrmGlyph from './glyphs/CrmGlyph.jsx';
import CreativeGlyph from './glyphs/CreativeGlyph.jsx';
import { FULL, STROKE, DRAW_ORDER, VIEWBOX } from './emblem/geometry.js';
import styles from './NileauxConvergence.module.css';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/*
 * Everything shares one SVG coordinate system per breakpoint, so tributaries,
 * the river, and the emblem are composed against each other, never against the
 * viewport. No layout is measured on scroll.
 *
 * The emblem's river leaves the mark at its bottom right. In emblem units the
 * three ribbon tips sit at roughly (700,955), (738,913) and (757,913). The
 * composition is built around that mouth: the tributaries flow around the mark
 * into a basin beneath it, the river rises out of the basin into the mouth, and
 * the emblem's own strokes then grow upward from their lowest points.
 *
 * Desktop box 1200x700, emblem 290 units wide at (455,165), mouth near (661,430).
 * Mobile  box  375x650, emblem 210 units wide at (82,190),  mouth near (231,380).
 */
const DESKTOP = {
  viewBox: '0 0 1200 700',
  emblem: { x: 455, y: 165, scale: 290 / 1024 },
  // From the basin up into the three ribbon tips.
  river: [
    'M616 582 C 640 548 648 500 653 436',
    'M662 590 C 672 548 662 486 664 424',
    'M706 584 C 690 548 680 492 669 424',
  ],
  channels: [
    { name: 'search', Glyph: SearchGlyph, begin: 0.12, arrive: 0.70, d: 'M330 140 C 300 300 416 520 608 572' },
    { name: 'social', Glyph: SocialGlyph, begin: 0.165, arrive: 0.735, d: 'M1040 130 C 980 270 896 486 704 574' },
    { name: 'web', Glyph: WebGlyph, begin: 0.135, arrive: 0.71, d: 'M140 400 C 262 440 444 528 616 584' },
    { name: 'analytics', Glyph: AnalyticsGlyph, begin: 0.195, arrive: 0.755, d: 'M1070 420 C 960 468 826 548 708 588' },
    { name: 'conversion', Glyph: ConversionGlyph, begin: 0.15, arrive: 0.725, d: 'M210 590 C 330 626 486 624 624 594' },
    { name: 'crm', Glyph: CrmGlyph, begin: 0.21, arrive: 0.765, d: 'M980 600 C 880 638 792 626 704 596' },
    { name: 'creative', Glyph: CreativeGlyph, begin: 0.18, arrive: 0.745, d: 'M440 90 C 376 230 394 478 600 578' },
  ],
};

const MOBILE = {
  viewBox: '0 0 375 650',
  emblem: { x: 82, y: 190, scale: 210 / 1024 },
  river: [
    'M216 520 C 226 488 226 440 226 388',
    'M242 524 C 240 486 236 436 234 380',
  ],
  channels: [
    { name: 'search', Glyph: SearchGlyph, begin: 0.12, arrive: 0.70, d: 'M44 118 C 26 262 90 450 206 508' },
    { name: 'social', Glyph: SocialGlyph, begin: 0.17, arrive: 0.74, d: 'M326 126 C 352 266 316 436 252 512' },
    { name: 'web', Glyph: WebGlyph, begin: 0.14, arrive: 0.715, d: 'M34 346 C 92 410 150 480 214 518' },
    { name: 'analytics', Glyph: AnalyticsGlyph, begin: 0.2, arrive: 0.76, d: 'M340 392 C 304 450 272 490 246 520' },
    { name: 'conversion', Glyph: ConversionGlyph, begin: 0.155, arrive: 0.73, d: 'M70 556 C 118 560 180 548 224 526' },
  ],
};

// Formation, as fractions of the scroll: [start, duration]. River first, from
// the mouth upward; crescent follows as the silhouette's loop continues; the
// right crescent and the star complete it.
const DRAW_PLAN = {
  silhouette: [0.78, 0.11],
  ribbonLower: [0.79, 0.06],
  ribbonInner: [0.83, 0.06],
  ribbonLeft: [0.845, 0.045],
  crescentRightOuter: [0.855, 0.045],
  crescentRightInner: [0.865, 0.04],
  starOuter: [0.89, 0.03],
  starInner: [0.9, 0.025],
};

function Emblem({ layout }) {
  const { x, y, scale } = layout.emblem;
  return (
    <g data-emblem transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Stroke layer: the same geometry as lines, each subpath growing from its lowest point. */}
      <g className={styles.emblemStroke} data-emblem-stroke>
        {DRAW_ORDER.map((key) => (
          <path key={key} data-emblem-path={key} d={STROKE[key]} />
        ))}
      </g>
      {/* Fill layer: the supplied emblem, untouched, resolving over the lines. */}
      <path className={styles.emblemFill} data-emblem-fill d={FULL} fillRule="evenodd" />
    </g>
  );
}

function Composition({ layout, mobile = false }) {
  return (
    <svg
      className={`${styles.signals} ${mobile ? styles.mobile : styles.desktop}`}
      data-composition={mobile ? 'mobile' : 'desktop'}
      viewBox={layout.viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {layout.channels.map(({ name, Glyph, d }) => {
        const [, sx, sy] = d.match(/^M\s*([\d.]+)\s+([\d.]+)/);
        return (
          <g key={name} data-channel={name}>
            <path className={styles.path} data-path d={d} />
            <g data-traveler transform={`translate(${sx} ${sy})`}>
              <g className={styles.glyph} data-glyph><Glyph /></g>
              <circle className={styles.signal} data-signal r={mobile ? 1.8 : 1.6} />
            </g>
          </g>
        );
      })}
      <g data-river>
        {layout.river.map((d, i) => (
          <path key={i} className={styles.river} data-river-path d={d} />
        ))}
      </g>
      <Emblem layout={layout} />
    </svg>
  );
}

/**
 * One self-contained scroll section: seven channels become signals, the signals
 * gather beneath the mark, rise as one river into it, and the river becomes the
 * Nileaux emblem.
 * reducedMotion=true forces the static composition; the OS preference always wins.
 * The default CSS state is the resolved composition, for no-JS and reduced motion.
 */
export default function NileauxConvergence({ className = '', reducedMotion = false }) {
  const rootRef = useRef(null);
  const titleId = useId();

  useBrowserLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(
        {
          desktop: '(min-width: 701px)',
          mobile: '(max-width: 700px)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        ({ conditions }) => {
          if (reducedMotion || conditions.reduce) return undefined;

          const mobile = conditions.mobile;
          const layout = mobile ? MOBILE : DESKTOP;
          const composition = root.querySelector(`[data-composition="${mobile ? 'mobile' : 'desktop'}"]`);
          const select = gsap.utils.selector(root);
          const inComposition = gsap.utils.selector(composition);

          root.dataset.motion = 'scroll';

          // Keep the final copy positioned relative to the emblem's rendered size.
          const syncScale = () => {
            const ctm = composition.getScreenCTM();
            if (ctm) root.style.setProperty('--nc-scale', String(ctm.a));
          };
          syncScale();

          // Start states.
          gsap.set(select('[data-intro], [data-scroll-cue]'), { opacity: 1, y: 0 });
          gsap.set(select('[data-middle], [data-final-copy], [data-tagline]'), { opacity: 0, y: 8 });
          gsap.set(inComposition('[data-emblem-fill]'), { opacity: 0 });

          // Each emblem path starts invisible with a zero-length dash centred on
          // its lowest node. The dash grows in both directions as the offset
          // tracks half its length, so the line climbs the mark from the bottom.
          const emblemPaths = inComposition('[data-emblem-path]');
          emblemPaths.forEach((p) => {
            const length = p.getTotalLength();
            p.dataset.length = String(length);
            gsap.set(p, { strokeDasharray: `0 ${length}`, strokeDashoffset: 0, opacity: 0 });
          });

          const riverPaths = inComposition('[data-river-path]');
          riverPaths.forEach((p) => {
            const length = p.getTotalLength();
            gsap.set(p, { strokeDasharray: length, strokeDashoffset: length, opacity: 0 });
          });

          // CSS sticky owns the hold. ScrollTrigger maps the section's scroll span to
          // one normalized timeline, so every moment below is a fraction of the scroll.
          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.8,
              invalidateOnRefresh: true,
              onRefresh: syncScale,
            },
          });
          timeline.to({}, { duration: 1 }, 0);

          // 0–12% stillness · 12–35% activation · 35–55% alignment · 55–68% dissolution
          // 68–78% river forms · 78–92% emblem climbs · 92–100% resolution
          layout.channels.forEach(({ name, d, begin, arrive }, index) => {
            const channel = composition.querySelector(`[data-channel="${name}"]`);
            const path = channel.querySelector('[data-path]');
            const traveler = channel.querySelector('[data-traveler]');
            const glyph = channel.querySelector('[data-glyph]');
            const signal = channel.querySelector('[data-signal]');
            const length = path.getTotalLength();
            const stagger = index * 0.012;

            gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 0 });
            gsap.set(glyph, { opacity: 0.82, scale: 1, transformOrigin: '0 0' });
            gsap.set(signal, { opacity: 0 });

            // The glyph travels its own path; the line is drawn in its wake.
            timeline.to(traveler, { motionPath: { path: d, autoRotate: false }, duration: arrive - begin, ease: 'power1.inOut' }, begin);
            timeline.to(path, { opacity: 0.32, duration: 0.1 }, begin);
            timeline.to(path, { strokeDashoffset: 0, duration: arrive - begin, ease: 'power1.inOut' }, begin);

            // Alignment: the glyph quietly loses prominence.
            timeline.to(glyph, { opacity: 0.68, scale: 0.92, duration: 0.2, ease: 'power1.inOut' }, 0.35 + stagger);

            // Dissolution: glyph becomes a point of light that keeps travelling.
            timeline.to(glyph, { opacity: 0, scale: 0.8, duration: 0.09, ease: 'power1.in' }, 0.55 + stagger);
            timeline.to(signal, { opacity: 0.9, duration: 0.08 }, 0.56 + stagger);
            timeline.to(signal, { opacity: 0, duration: 0.05 }, arrive - 0.03);

            // Tributaries stay beneath the rising river, then fade as the mark takes over.
            timeline.to(path, { opacity: 0.14, duration: 0.08 }, 0.72 + stagger * 0.5);
            timeline.to(path, { opacity: 0, duration: 0.08 }, 0.84 + stagger * 0.5);
          });

          // The river: out of the basin, up into the mouth of the mark.
          riverPaths.forEach((p, i) => {
            timeline.to(p, { opacity: 0.62, duration: 0.03 }, 0.68 + i * 0.02);
            timeline.to(p, { strokeDashoffset: 0, duration: 0.1, ease: 'power1.inOut' }, 0.68 + i * 0.02);
            timeline.to(p, { opacity: 0, duration: 0.07 }, 0.86 + i * 0.015);
          });

          // Formation: each subpath climbs from its lowest node; the fill resolves over the strokes.
          emblemPaths.forEach((p) => {
            const [at, duration] = DRAW_PLAN[p.dataset.emblemPath];
            const length = Number(p.dataset.length);
            timeline.to(p, { opacity: 1, duration: 0.008 }, at);
            timeline.to(p, { strokeDasharray: `${length} 0`, strokeDashoffset: length / 2, duration, ease: 'power1.inOut' }, at);
          });
          timeline.to(inComposition('[data-emblem-fill]'), { opacity: 1, duration: 0.07, ease: 'power1.inOut' }, 0.9);

          // Copy.
          timeline.to(select('[data-scroll-cue]'), { opacity: 0, duration: 0.06 }, 0.12);
          timeline.to(select('[data-intro]'), { opacity: 0, y: -6, duration: 0.1 }, 0.16);
          timeline.to(select('[data-middle]'), { opacity: 1, y: 0, duration: 0.05 }, 0.69);
          timeline.to(select('[data-middle]'), { opacity: 0, y: -6, duration: 0.05 }, 0.765);
          timeline.to(select('[data-final-copy]'), { opacity: 1, y: 0, duration: 0.05 }, 0.94);
          timeline.to(select('[data-tagline]'), { opacity: 1, y: 0, duration: 0.04 }, 0.97);

          return () => {
            delete root.dataset.motion;
            root.style.removeProperty('--nc-scale');
          };
        },
      );
    }, root);

    return () => {
      media.revert();
      context.revert();
      delete root.dataset.motion;
    };
  }, [reducedMotion]);

  return (
    <section
      ref={rootRef}
      className={`${styles.section} ${className}`.trim()}
      data-register="dark"
      data-nileaux-convergence=""
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className={styles.srOnly}>Many signals. One system. One direction.</h2>
      <p className={styles.srOnly}>
        Search, social, web, analytics, conversion, lead flow and creative, brought into one coordinated growth system.
        Flow Further.
      </p>

      <div className={styles.stage}>
        <Composition layout={DESKTOP} />
        <Composition layout={MOBILE} mobile />

        <div className={styles.editorial} aria-hidden="true">
          <p className={styles.intro} data-intro>Growth rarely moves<br />through one channel.</p>
          <p className={styles.middle} data-middle>Different signals.</p>
        </div>

        <div className={styles.resolution} aria-hidden="true">
          <p className={styles.statement} data-final-copy>One system. One direction.</p>
          <p className={styles.tagline} data-tagline>Flow Further.</p>
        </div>

        <div className={styles.scrollCue} data-scroll-cue aria-hidden="true">
          <span className={styles.cueLine} />
          <span>Scroll</span>
        </div>
      </div>
    </section>
  );
}

export { VIEWBOX as EMBLEM_VIEWBOX };
