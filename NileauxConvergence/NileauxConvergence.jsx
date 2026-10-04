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
import { FULL, SUBPATHS, DRAW_ORDER, VIEWBOX } from './emblem/geometry.js';
import styles from './NileauxConvergence.module.css';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/*
 * Everything shares one SVG coordinate system per breakpoint, so the tributaries,
 * the central current, and the emblem are composed against each other rather
 * than against the viewport. No layout is measured on scroll.
 *
 * Desktop box 1200x700, flow zone around (600, 350), emblem 290 units wide.
 * Mobile  box  375x650, flow zone around (187, 325), emblem 210 units wide.
 *
 * Tributaries end at different points on the rim of the flow zone and at
 * different angles. The current lines then run through the zone along the
 * same diagonal the emblem's river takes (upper left to lower right), so the
 * emblem draws on top of lines that are already heading its way.
 */
const DESKTOP = {
  viewBox: '0 0 1200 700',
  emblem: { x: 455, y: 205, scale: 290 / 1024 },
  current: [
    'M470 300 C 530 300 560 345 612 362 S 660 400 680 450',
    'M486 326 C 540 330 575 368 622 380 S 664 420 692 470',
    'M500 280 C 556 282 590 322 636 340 S 672 376 690 416',
  ],
  channels: [
    { name: 'search', Glyph: SearchGlyph, begin: 0.12, arrive: 0.70, d: 'M330 140 C 400 150 452 232 500 285' },
    { name: 'social', Glyph: SocialGlyph, begin: 0.165, arrive: 0.735, d: 'M1040 130 C 952 196 764 214 690 300' },
    { name: 'web', Glyph: WebGlyph, begin: 0.135, arrive: 0.71, d: 'M140 400 C 262 412 384 362 480 330' },
    { name: 'analytics', Glyph: AnalyticsGlyph, begin: 0.195, arrive: 0.755, d: 'M1070 420 C 980 404 850 378 735 440' },
    { name: 'conversion', Glyph: ConversionGlyph, begin: 0.15, arrive: 0.725, d: 'M210 590 C 330 602 442 520 560 395' },
    { name: 'crm', Glyph: CrmGlyph, begin: 0.21, arrive: 0.765, d: 'M980 600 C 882 604 792 540 720 450' },
    { name: 'creative', Glyph: CreativeGlyph, begin: 0.18, arrive: 0.745, d: 'M430 90 C 470 172 522 232 580 290' },
  ],
};

const MOBILE = {
  viewBox: '0 0 375 650',
  emblem: { x: 82, y: 220, scale: 210 / 1024 },
  current: [
    'M96 290 C 138 290 160 322 198 334 S 232 362 246 398',
    'M108 310 C 146 312 170 340 204 350 S 238 378 250 414',
  ],
  channels: [
    { name: 'search', Glyph: SearchGlyph, begin: 0.12, arrive: 0.70, d: 'M44 118 C 90 112 118 212 140 275' },
    { name: 'social', Glyph: SocialGlyph, begin: 0.17, arrive: 0.74, d: 'M326 126 C 300 190 262 226 240 282' },
    { name: 'web', Glyph: WebGlyph, begin: 0.14, arrive: 0.715, d: 'M34 346 C 62 356 90 342 112 332' },
    { name: 'analytics', Glyph: AnalyticsGlyph, begin: 0.2, arrive: 0.76, d: 'M340 392 C 312 380 288 362 264 352' },
    { name: 'conversion', Glyph: ConversionGlyph, begin: 0.155, arrive: 0.73, d: 'M66 556 C 108 556 130 464 150 402' },
  ],
};

function Emblem({ layout }) {
  const { x, y, scale } = layout.emblem;
  return (
    <g data-emblem transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Stroke layer: the same geometry as lines, drawn one subpath at a time. */}
      <g className={styles.emblemStroke} data-emblem-stroke>
        {DRAW_ORDER.map((key) => (
          <path key={key} data-emblem-path={key} d={SUBPATHS[key]} />
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
      <g data-current>
        {layout.current.map((d, i) => (
          <path key={i} className={styles.current} data-current-path d={d} />
        ))}
      </g>
      <Emblem layout={layout} />
    </svg>
  );
}

/**
 * One self-contained scroll section: seven channels become signals, join one
 * current, and that current becomes the Nileaux emblem.
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

          const emblemPaths = inComposition('[data-emblem-path]');
          // Each emblem path stays invisible until its own draw begins; a zero-length
          // dash with round caps would otherwise render as a stray dot at rest.
          emblemPaths.forEach((p) => {
            const length = p.getTotalLength();
            gsap.set(p, { strokeDasharray: length, strokeDashoffset: length, opacity: 0 });
          });

          const currentPaths = inComposition('[data-current-path]');
          currentPaths.forEach((p) => {
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
              scrub: 0.5,
              invalidateOnRefresh: true,
              onRefresh: syncScale,
            },
          });
          timeline.to({}, { duration: 1 }, 0);

          // 0–12% stillness · 12–35% activation · 35–55% alignment · 55–68% dissolution
          // 68–78% current forms · 78–92% emblem draws · 92–100% resolution
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

            // Tributary lines stay under the forming current, then fade as the emblem takes over.
            timeline.to(path, { opacity: 0.14, duration: 0.08 }, 0.72 + stagger * 0.5);
            timeline.to(path, { opacity: 0, duration: 0.08 }, 0.82 + stagger * 0.5);
          });

          // Central current: the tributaries' direction becomes a shared set of lines.
          currentPaths.forEach((p, i) => {
            timeline.to(p, { opacity: 0.6, duration: 0.03 }, 0.68 + i * 0.02);
            timeline.to(p, { strokeDashoffset: 0, duration: 0.1, ease: 'power1.inOut' }, 0.68 + i * 0.02);
            timeline.to(p, { opacity: 0, duration: 0.07 }, 0.84 + i * 0.015);
          });

          // Emblem formation: each subpath draws in order, stroke first, fill resolving over it.
          const drawPlan = {
            silhouette: [0.78, 0.1],
            ribbonInner: [0.81, 0.07],
            ribbonLeft: [0.825, 0.05],
            ribbonLower: [0.835, 0.065],
            crescentRightOuter: [0.85, 0.05],
            crescentRightInner: [0.86, 0.045],
            starOuter: [0.885, 0.03],
            starInner: [0.895, 0.025],
          };
          emblemPaths.forEach((p) => {
            const [at, duration] = drawPlan[p.dataset.emblemPath];
            timeline.to(p, { opacity: 1, duration: 0.008 }, at);
            timeline.to(p, { strokeDashoffset: 0, duration, ease: 'power1.inOut' }, at);
          });
          timeline.to(inComposition('[data-emblem-fill]'), { opacity: 1, duration: 0.07, ease: 'power1.inOut' }, 0.88);

          // Copy.
          timeline.to(select('[data-scroll-cue]'), { opacity: 0, duration: 0.06 }, 0.12);
          timeline.to(select('[data-intro]'), { opacity: 0, y: -6, duration: 0.1 }, 0.16);
          timeline.to(select('[data-middle]'), { opacity: 1, y: 0, duration: 0.05 }, 0.69);
          timeline.to(select('[data-middle]'), { opacity: 0, y: -6, duration: 0.05 }, 0.765);
          timeline.to(select('[data-final-copy]'), { opacity: 1, y: 0, duration: 0.05 }, 0.93);
          timeline.to(select('[data-tagline]'), { opacity: 1, y: 0, duration: 0.04 }, 0.96);

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
