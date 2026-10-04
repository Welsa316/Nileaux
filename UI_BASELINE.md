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

## Registers

Two surfaces, each with its own ink:

| Register | Surface | Primary ink | Muted ink | Hairline |
| --- | --- | --- | --- | --- |
| Midnight (opening) | `--nx-midnight` #0a1020, lifts to `--nx-navy` / `--nx-navy-2` | `--nx-ivory` | `--nx-mist` | `--nx-line-on-dark` |
| Ivory (secondary) | `--nx-ivory` #f2eee6, lifts to `--nx-white` | `--nx-ink` | `--nx-slate` | `--nx-line-on-light` |

`--nx-sand` is the only warm accent. It is reserved for focus rings and the occasional
hairline. No green. No gold surfaces. No gradients as filler; the only gradients are
scrims over photography and a faint horizon behind the hero frame.

Elevation on midnight comes from stepped surfaces and hairlines, never from shadows.

Every section declares `data-register="dark"` or `"light"`. The nav reads the register of
the band under its midline and flips its ink and band colour; button variants for the
ivory register are scoped under `[data-register='light']` in `base.css`. Page order:
midnight (hero, positioning) → ivory (acquisition) → midnight (system) → ivory (approach,
work) → midnight (closing).

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
