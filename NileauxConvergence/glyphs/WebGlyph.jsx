import React from 'react';

export default function WebGlyph(props) {
  return (
    <g {...props} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <rect x="-12" y="-9.5" width="24" height="19" rx="2" />
      <path d="M-12-3.5h24M-7.5-6.5h.1M-4-6.5h.1M-7 2h8M-7 5.5h5" />
    </g>
  );
}
