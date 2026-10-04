import React from 'react';

/** SVG artwork, centered at 0,0; render inside an <svg>. */
export default function SearchGlyph(props) {
  return (
    <g {...props} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="-3" cy="-3" r="8.5" />
      <path d="m3.2 3.2 7.3 7.3" />
    </g>
  );
}
