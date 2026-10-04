import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface ScrollExpandProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  src?: string;
  mediaType?: 'image' | 'video';
  poster?: string;
  alt?: string;
  title?: string;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  useWindowScroll?: boolean;
  enabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

declare const ScrollExpand: (props: ScrollExpandProps) => JSX.Element;
export default ScrollExpand;
