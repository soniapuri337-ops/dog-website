import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ScrollStory from '../components/ScrollStory';
import Promises from '../components/Promises';
import Reviews from '../components/Reviews';
import Services from '../components/Services';
import CTABand from '../components/CTABand';
import { scrollToHash } from '../lib/scroll';

export default function Home() {
  const location = useLocation();

  /* Arriving from another route with a section in mind, land on it once the
     page has laid out. */
  useEffect(() => {
    const hash = location.state?.hash || location.hash;
    if (!hash) return undefined;
    const id = window.setTimeout(() => scrollToHash(hash), 260);
    return () => window.clearTimeout(id);
  }, [location]);

  return (
    <main>
      <ScrollStory />
      <Promises />
      <Reviews />
      <Services />
      <CTABand />
    </main>
  );
}
