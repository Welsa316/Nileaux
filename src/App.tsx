import Nav from './sections/Nav';
import Hero from './sections/Hero';
import Positioning from './sections/Positioning';
import { useSmoothScroll } from './lib/motion';

export default function App() {
  useSmoothScroll();

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Positioning />
      </main>
    </>
  );
}
