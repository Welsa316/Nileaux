import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { scrollToTarget } from '../lib/motion';
import './Nav.css';

const LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#approach', label: 'Approach' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
];

type Register = 'dark' | 'light';

export default function Nav() {
  const ref = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);
  const [register, setRegister] = useState<Register>('dark');

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The nav takes the register of whichever band sits under its midline.
  useEffect(() => {
    let io: IntersectionObserver | null = null;

    const observe = () => {
      io?.disconnect();
      const mid = 38;
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setRegister((e.target.getAttribute('data-register') as Register) || 'dark');
          });
        },
        { rootMargin: `-${mid}px 0px -${Math.max(0, window.innerHeight - mid - 1)}px 0px`, threshold: 0 },
      );
      document.querySelectorAll('[data-register]').forEach((s) => io?.observe(s));
    };

    observe();
    window.addEventListener('resize', observe);
    return () => {
      window.removeEventListener('resize', observe);
      io?.disconnect();
    };
  }, []);

  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const el = document.querySelector<HTMLElement>(href);
    if (!el) return;
    e.preventDefault();
    scrollToTarget(el);
  };

  const cls = ['nx-nav', stuck ? 'nx-nav--stuck' : '', register === 'light' ? 'nx-nav--light' : ''].filter(Boolean).join(' ');

  return (
    <header ref={ref} className={cls}>
      <div className="nx-nav__inner">
        <a className="nx-nav__brand" href="#top" onClick={go} aria-label="Nileaux, back to top">
          <span className="nx-wordmark">Nileaux</span>
        </a>

        <nav className="nx-nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} className="nx-link nx-nav__link" href={l.href} onClick={go}>
              {l.label}
            </a>
          ))}
        </nav>

        <a className="nx-btn nx-btn--ghost nx-btn--sm nx-nav__cta" href="#contact" onClick={go}>
          <span className="nx-nav__cta-long">Start a conversation</span>
          <span className="nx-nav__cta-short">Contact</span>
        </a>
      </div>
    </header>
  );
}
