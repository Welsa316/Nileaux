import React from 'react';

export default function SocialGlyph(props) {
  return (
    <g {...props} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="m-6.7-4.8 13.1-3.4M-7.5-1.1l6.8 9M7.9-5.1 3.2 8" />
      <circle cx="-9" cy="-4" r="3" />
      <circle cx="9" cy="-9" r="3" />
      <circle cx="1.5" cy="10.5" r="3" />
    </g>
  );
}
