import Nav from './sections/Nav';
import Hero from './sections/Hero';
import Positioning from './sections/Positioning';
import Acquisition from './sections/Acquisition';
import System from './sections/System';
import Approach from './sections/Approach';
import Work from './sections/Work';
import Closing from './sections/Closing';
import { useSmoothScroll } from './lib/motion';

export default function App() {
  useSmoothScroll();

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Positioning />
        <Acquisition />
        <System />
        <Approach />
        <Work />
        <Closing />
      </main>
    </>
  );
}
