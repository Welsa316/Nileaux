# Nileaux Convergence

A standalone React section: seven channels become signals, the signals join one
current, and that current becomes the Nileaux emblem. Nothing is wired into the
homepage; the component is self-contained.

## Integration

The host already has React and GSAP. No installation or package changes are needed.

```jsx
import NileauxConvergence from './NileauxConvergence/NileauxConvergence.jsx';

<NileauxConvergence />
```

Props: `className` (optional), `reducedMotion` (optional boolean, default false;
`true` forces the static composition, and the OS preference always wins). A
TypeScript declaration is included. JSX and CSS Modules must be supported by the
host bundler.

The emblem is the supplied `assets/nileaux-emblem.svg`, unmodified. Its geometry is
exposed per subpath in `emblem/geometry.js` (generated, see `assets/README.md`).
Line colour is one CSS custom property, `--nc-line` (default `#c5a094`, a muted
rose-bronze). Override it on `className`:

```css
.myConvergence { --nc-line: #cfc2b8; --nc-travel: 220svh; }
```

## Preview without changing the app

```sh
node node_modules/vite/bin/vite.js --config NileauxConvergence/preview/vite.config.mjs
```

Open `http://127.0.0.1:5187`. Separate Vite root, port, cache and build directory;
the site's entry point and config are untouched. The toolbar and scrubber are
preview tools only.

## The sequence

One normalized GSAP timeline, scrubbed by one ScrollTrigger across a CSS-sticky
stage: 240svh of travel on desktop, 170svh on phones.

| Progress | Phase | What happens |
| --- | --- | --- |
| 0–12% | Stillness | Seven glyphs sit asymmetrically around the viewport. Paths are invisible. "Growth rarely moves through one channel." |
| 12–35% | Activation | Each glyph starts along its own curve, staggered. Its line is drawn in its wake with stroke-dashoffset. |
| 35–55% | Alignment | Glyphs ease to 0.68 opacity and 0.92 scale. Nothing dramatic. |
| 55–68% | Dissolution | Each glyph becomes a single point of light that keeps travelling. |
| 68–78% | Current | Three lines draw through the flow zone on the same diagonal the emblem's river takes. Tributaries dim underneath. "Different signals." |
| 78–92% | Formation | The emblem's eight subpaths draw as strokes, in order: silhouette, inner ribbons, right crescent, star. Tributaries and current fade out beneath it (gone by 90%). The fill resolves over the strokes from 88%. |
| 92–100% | Resolution | Emblem alone, centred. "One system. One direction." then "Flow Further." |

Geometry lives in two SVG coordinate systems (1200×700 desktop, 375×650 phone)
so tributaries, current and emblem are composed against each other, not the
viewport. The phone layout has its own five channels and shorter paths.

The tributaries do not meet at one point. They enter a small flow zone at different
positions and angles, and the current lines run through that zone along the river
inside the emblem, so the mark draws over lines already heading its way.

## Reduced motion and no JavaScript

The CSS default state is the resolved composition: faint glyphs and lines around
the complete emblem with the final copy. With `prefers-reduced-motion: reduce`, or
`reducedMotion`, there is no sticky hold and no timeline or ScrollTrigger.

## Cleanup

`gsap.context()` and `gsap.matchMedia()` revert everything on unmount, breakpoint
change and reduced-motion change. Keep ancestors free of `overflow: hidden/auto`,
which captures CSS sticky. If the host uses Lenis, keep its existing ScrollTrigger
integration; this component adds no scroll listeners of its own.
