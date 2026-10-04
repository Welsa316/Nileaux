import React, { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import NileauxConvergence from '../NileauxConvergence.jsx';
import './preview.css';

function Preview() {
  const [staticMode, setStaticMode] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [progress, setProgress] = useState(0);
  const scheduled = useRef(0);

  useEffect(() => {
    const readProgress = () => {
      scheduled.current = 0;
      const section = document.querySelector('[data-nileaux-convergence]');
      if (!section || section.dataset.motion !== 'scroll') { setProgress(100); return; }
      const rect = section.getBoundingClientRect();
      setProgress(Math.round(Math.min(1, Math.max(0, -rect.top / (rect.height - innerHeight))) * 100));
    };
    const requestRead = () => {
      if (!scheduled.current) scheduled.current = requestAnimationFrame(readProgress);
    };
    addEventListener('scroll', requestRead, { passive: true });
    addEventListener('resize', requestRead, { passive: true });
    requestRead();
    return () => {
      removeEventListener('scroll', requestRead);
      removeEventListener('resize', requestRead);
      cancelAnimationFrame(scheduled.current);
      scheduled.current = 0;
    };
  }, [staticMode, mounted]);

  const jump = (value) => {
    const section = document.querySelector('[data-nileaux-convergence]');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    scrollTo({ top: scrollY + rect.top + Math.max(0, rect.height - innerHeight) * value / 100, behavior: 'instant' });
  };

  const phase =
    progress < 12 ? 'Stillness'
    : progress < 35 ? 'Activation'
    : progress < 55 ? 'Alignment'
    : progress < 68 ? 'Dissolution'
    : progress < 78 ? 'Current'
    : progress < 92 ? 'Formation'
    : 'Nileaux';

  return (
    <>
      <header className="preview-toolbar">
        <a href="#study" className="preview-brand">NILEAUX <span>/ Motion study</span></a>
        <div className="preview-controls">
          <label className="preview-static"><input type="checkbox" checked={staticMode} onChange={(event) => setStaticMode(event.target.checked)} />Reduced motion</label>
          <button type="button" onClick={() => setMounted((value) => !value)}>{mounted ? 'Unmount' : 'Mount'}</button>
        </div>
      </header>
      <main id="study">
        {mounted ? <NileauxConvergence reducedMotion={staticMode} /> : <div className="preview-unmounted">Component unmounted. ScrollTrigger and styles have been released.</div>}
        <footer className="preview-boundary"><span>End of component</span><p>The next section continues here.</p><button type="button" onClick={() => jump(0)}>Return to beginning ↑</button></footer>
      </main>
      <div className="preview-scrubber">
        <label htmlFor="progress">{staticMode ? 'Static composition' : phase}</label>
        <input id="progress" type="range" min="0" max="100" value={progress} disabled={staticMode || !mounted} onChange={(event) => jump(Number(event.target.value))} aria-label="Animation scroll progress" />
        <output htmlFor="progress">{progress.toString().padStart(2, '0')}%</output>
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><Preview /></StrictMode>);
