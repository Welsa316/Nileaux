import React from 'react';

/** A signal entering a bracket: the moment attention becomes an outcome. */
export default function ConversionGlyph(props) {
  return (
    <g {...props} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2-10h8v20H2" />
      <path d="M-12 0h16M0-5l5 5-5 5" />
    </g>
  );
}
