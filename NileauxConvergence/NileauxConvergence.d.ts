import type { ReactElement } from 'react';

export interface NileauxConvergenceProps {
  className?: string;
  /** Force the static composition. The OS reduced-motion preference always wins. */
  reducedMotion?: boolean;
}

export default function NileauxConvergence(props: NileauxConvergenceProps): ReactElement;

/** viewBox of the supplied emblem, "0 0 1024 1024". */
export const EMBLEM_VIEWBOX: string;
