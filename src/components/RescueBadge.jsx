import { useEffect, useRef } from 'react';
import { rescueBadge } from '../data/site';

/* Anchored to the bottom right of the film. The grade already crops that corner
   away, so this pill is belt and braces: it permanently occupies the spot a
   watermark would sit in, and doubles as a trust marker. */
export default function RescueBadge() {
  const ref = useRef(null);
  const numRef = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const write = (v) => {
      if (numRef.current) numRef.current.textContent = v + rescueBadge.suffix;
    };
    const run = () => {
      if (done.current) return;
      done.current = true;
      if (reduce) { write(rescueBadge.count); return; }
      const dur = 1600;
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        write(Math.round(eased * rescueBadge.count));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) run(); }),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-30 sm:bottom-5 sm:right-5 lg:bottom-7 lg:right-8"
    >
      <div className="flex items-center gap-2.5 rounded-full border border-moss/30 bg-white/78 px-3.5 py-2 shadow-pill backdrop-blur-xl sm:gap-3 sm:px-4 sm:py-2.5">
        <span className="relative flex h-2 w-2 shrink-0 sm:h-2.5 sm:w-2.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-70" />
          <span className="relative inline-flex h-full w-full rounded-full bg-rose" />
        </span>
        <span className="whitespace-nowrap font-sans text-[0.7rem] font-bold leading-none text-ink sm:text-[0.82rem]">
          <span ref={numRef} className="font-extrabold text-moss tabular-nums">
            0{rescueBadge.suffix}
          </span>{' '}
          {rescueBadge.label}
        </span>
      </div>
    </div>
  );
}
