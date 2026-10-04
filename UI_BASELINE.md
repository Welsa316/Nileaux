# Nileaux UI baseline

Source of truth for spacing, type, colour, motion, and component conventions on the
Nileaux site. Tokens live in `src/styles/tokens.css`; this document explains how to
use them. Extend it when a new convention is established. Do not override it casually.

## Stack

- Vite 5, React 18, TypeScript. Plain CSS files per section, scoped by an `nx-` prefix.
  No utility framework, no component library.
- GSAP 3.15 (ScrollTrigger, SplitText) for choreography. Lenis for inertia scroll.
- The hero expansion is the React Bits `ScrollExpand` component, kept verbatim in
  `src/components/ScrollExpand/`. Theme it with more specific selectors from the section
  stylesheet, never by editing the component.
- The hero media is a video that scroll scrubs; it never autoplays or loops. `Hero.tsx`
  switches the element's autoplay and loop off before data arrives and, after
  `loadedmetadata`, maps a scrubbed ScrollTrigger over the same track to `currentTime`
  (first frame held through the opening 12%). Encodes for scrubbing live in
  `public/video/` with a keyframe every six frames; a source with sparse keyframes will
  scrub choppily, so re-encode rather than mask it with easing. Desktop pins for 320vh,
  phones for 220vh. The type lockup (name, headline, lede, actions) lives in the hero's
  own sticky layer, not in the component's title prop. Reduced motion and video failure render the poster composition.

## Registers

Two surfaces, each with its own ink:

Palette: Ink Black #071522 and #111820, Cinnamon Wood #B47E6A, Dust Grey #CFC2B8, Soft
Linen #F4F0E8.

| Register | Surface | Primary ink | Muted ink | Hairline |
| --- | --- | --- | --- | --- |
| Ink (opening) | `--nx-midnight` #071522, lifts to `--nx-navy` #111820 / `--nx-navy-2` | `--nx-ivory` (linen) | `--nx-mist` (dust) | `--nx-line-on-dark` |
| Linen (secondary) | `--nx-ivory` #f4f0e8, lifts to `--nx-white` | `--nx-ink` | `--nx-slate` (dust darkened to #635d56 for contrast) | `--nx-line-on-light` |

`--nx-accent` (cinnamon) appears as the system flow line and its nodes, the acquisition
progress rule, and focus rings. `--nx-rose` (rose bronze, #c5a094) is the emblem's line in
the convergence section and the fill of the hero's primary button (`.nx-btn--rose`, ink
text at 7:1). Neither is ever a surface. Dust grey at full strength is for text on ink only; on linen it fails contrast,
so `--nx-slate` is used instead. No green. No gradients as filler; the only gradients are
scrims over photography and a faint horizon behind the hero frame.

Elevation on midnight comes from stepped surfaces and hairlines, never from shadows.

Every section declares `data-register="dark"` or `"light"`. The nav reads the register of
the band under its midline and flips its ink and band colour; button variants for the
ivory register are scoped under `[data-register='light']` in `base.css`. Page order:
ink (hero, positioning, convergence) → linen (acquisition) → ink (system) → linen (work)
→ ink (closing). The convergence section is the standalone component in
`NileauxConvergence/`, mounted from `App.tsx`.

## Typography

- One family: Hanken Grotesk, weights 300 / 400 / 500. Geist Mono 400 / 500 for labels,
  indices, and numbers only.
- Display (`--nx-display`, 56 to 168px): weight 300, line-height 0.95, tracking -0.045em.
- Section statement (`--nx-h2`, 34 to 76px): weight 300, line-height 1.02, tracking -0.035em,
  max 16ch, `text-wrap: balance`.
- Lede (`--nx-lede`, 18 to 22px): weight 400, line-height 1.5, tracking -0.012em.
- Body 17px, line-height 1.5. Labels (`.nx-label`) 11px mono, uppercase, tracking 0.18em.
- Never italics. Never two-tone headlines. `hyphens: none` everywhere.
- Tabular numerals wherever figures align.

## Rhythm

- Gutter `--nx-gutter` = clamp(20px, 5vw, 72px). Content max `--nx-max` = 1440px.
- Section padding `--nx-section` = clamp(96px, 12vw, 180px) top and bottom.
- Editorial grid: a 2 / 10 split on desktop (eyebrow column, content column). Content
  columns use `minmax(0, 1fr)` and children carry `min-width: 0`.
- Nav is 76px, fixed, transparent over the hero. It gains a translucent midnight band and
  hairline once the hero has released.

## Components

- Buttons (`.nx-btn`): 48px, padding 0 24px, pill radius, 14px / 500. Solid is ivory on
  midnight; ghost is a 32% hairline. Hover changes colour or border in place. Nothing
  lifts, scales, or bounces. Arrow icons travel 3px on hover.
- Text links (`.nx-link`): 1px accent wipe that grows from the left and retracts to the
  right.
- Focus: 2px `--nx-sand` outline, 4px offset, on every interactive element.

## Motion

- Eases: `power3.out` for entrances, `power4.out` for masked line reveals,
  `power2.inOut` for scrubbed moves. CSS: `--nx-ease` cubic-bezier(.16,1,.3,1).
- Durations: hover 160 to 320ms; scroll reveals 0.7 to 0.9s; the hero intro is the one
  slow moment (1.5 to 1.7s).
- Staggers 0.06 to 0.08s. Travel 24 to 28px for reveals; masked lines from `yPercent: 110`.
- Masked text uses SplitText `mask: 'lines'` with `autoSplit`. Split after fonts settle.
- Start states are set in `useLayoutEffect` before paint. Every held element has a
  failsafe timer (4 to 5s) that forces its end state.
- Everything lives inside `gsap.context` and is reverted on unmount. Plugins register
  lazily through `ensurePlugins()`.
- `prefers-reduced-motion`: JS effects return before hiding anything, Lenis is skipped,
  and CSS transitions collapse to 1ms.
- Lenis owns the scroll position. In-page navigation goes through `scrollToTarget()`.

## Content rules

- No fabricated metrics, testimonials, logos, or screenshots. Placeholders are labelled.
- Copy is short and specific. No "unlock", "elevate", "seamless", "data-driven",
  "trusted partner".
- Imagery is used sparingly and credited in `public/images/ATTRIBUTION.md`.
