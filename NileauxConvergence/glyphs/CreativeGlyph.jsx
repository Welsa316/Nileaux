import React from 'react';

/** Creative: a nib-like lozenge with its centre line. */
export default function CreativeGlyph(props) {
  return (
    <g {...props} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0-11 8.5 0 0 11-8.5 0Z" />
      <path d="M0-4v15" />
    </g>
  );
}
