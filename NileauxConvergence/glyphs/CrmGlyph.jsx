import React from 'react';

/** Lead flow: a ledger of rows with one record marked. */
export default function CrmGlyph(props) {
  return (
    <g {...props} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-11-8h22M-11 0h22M-11 8h13" />
      <circle cx="8.5" cy="8" r="2.6" />
    </g>
  );
}
