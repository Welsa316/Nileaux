import Nav from './sections/Nav';
import Hero from './sections/Hero';
import Positioning from './sections/Positioning';
import NileauxConvergence from '../NileauxConvergence/NileauxConvergence';
import Acquisition from './sections/Acquisition';
import System from './sections/System';
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
        <NileauxConvergence />
        <Acquisition />
        <System />
        <Work />
        <Closing />
      </main>
    </>
  );
}
