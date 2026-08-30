import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, HeartHandshake, PawPrint, HandHeart, MessageCircleHeart } from 'lucide-react';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ComingSoon from './pages/ComingSoon';
import { setLenis, getLenis } from './lib/scroll';
import { pageVariants } from './lib/motion';

gsap.registerPlugin(ScrollTrigger);

/* Lenis owns the scroll position and GSAP reads from it, so the scrub and the
   inertia never disagree with each other. */
function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    // Lenis measures the page with ResizeObserver, which Safari 12 and early
    // Android browsers do not have. There, the page simply uses native scroll:
    // the scrub still works, it just loses the inertia.
    if (typeof ResizeObserver === 'undefined') return undefined;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: true,      // the film has to scrub under a finger too
      syncTouchLerp: 0.085,
      touchInertiaMultiplier: 22,
      wheelMultiplier: 1,
      gestureOrientation: 'vertical',
    });
    setLenis(lenis);
    window.__lenis = lenis; // handy for debugging and for programmatic scrolling

    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* Mobile browsers fire resize every time the URL bar slides. Rebuilding
       layout there yanks the scroll position, so only a real width change
       (or a rotation) triggers a refresh. */
    let laidOutW = window.innerWidth;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const onResize = () => {
      if (coarse && window.innerWidth === laidOutW) return;
      laidOutW = window.innerWidth;
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);
}

function RouteChrome() {
  const { pathname } = useLocation();
  useEffect(() => {
    const lenis = getLenis();
    window.scrollTo(0, 0);
    if (lenis) lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
  }, [pathname]);
  return null;
}

const pages = [
  {
    path: '/about',
    icon: Users,
    tint: 'sage',
    eyebrow: 'About us',
    title: 'Our story is still being written.',
    body: 'The full about page is on its way. Until then, the short version: a small team, a warm shelter, and a promise that no animal waits alone.',
    note: 'Want the long version? Call us and ask for a tour.',
  },
  {
    path: '/services',
    icon: HeartHandshake,
    tint: 'sage',
    eyebrow: 'Services',
    title: 'Every service, in full detail.',
    body: 'We are writing up each service properly, from the first rescue call to the last checkup. The summary of all six is on the home page today.',
    note: 'Need something now? We answer the phone every day.',
  },
  {
    path: '/adopt',
    icon: PawPrint,
    tint: 'blush',
    eyebrow: 'Adopt',
    title: 'Meet the ones waiting for you.',
    body: 'Our adoption listings are coming soon. In the meantime, tell us a little about your home and we will introduce you to the rescues who would love it.',
    note: 'Adoptions are matched slowly and thoughtfully, never rushed.',
  },
  {
    path: '/donate',
    icon: HandHeart,
    tint: 'blush',
    eyebrow: 'Donate',
    title: 'Give a rescue their next warm night.',
    body: 'Online giving opens shortly. Every gift buys food, medicine and a dry bed for an animal who had none of those things this morning.',
    note: 'Call us to set up a one time gift or a monthly donation.',
  },
  {
    path: '/contact',
    icon: MessageCircleHeart,
    tint: 'cream',
    eyebrow: 'Contact',
    title: 'We would love to hear from you.',
    body: 'The full contact form is being built. Until it lands, the fastest way to reach us is the phone, and the calmest is email. Both reach the same team.',
    note: 'Found an animal in distress? Call, do not email. We will come.',
  },
];

export default function App() {
  useSmoothScroll();
  const location = useLocation();

  return (
    <>
      <RouteChrome />
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        {/* Keyed on the path so each route mounts and leaves as its own element.
            mode="wait" lets the outgoing page finish before the next arrives,
            which stops the two overlapping mid fade. */}
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            {pages.map((p) => (
              <Route
                key={p.path}
                path={p.path}
                element={
                  <ComingSoon
                    eyebrow={p.eyebrow}
                    title={p.title}
                    body={p.body}
                    note={p.note}
                    icon={p.icon}
                    tint={p.tint}
                  />
                }
              />
            ))}
            <Route
              path="*"
              element={
                <ComingSoon
                  eyebrow="Page not found"
                  title="This page has wandered off."
                  body="It happens to the best of us. The rescue story is right where you left it, and we are always at the other end of the phone."
                  note=""
                  icon={PawPrint}
                  tint="sage"
                />
              }
            />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <Footer />
    </>
  );
}
