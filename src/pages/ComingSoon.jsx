import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { contact } from '../data/site';

/* A soft target of concentric rings with the page's own icon at the centre.
   Same construction on every route, tinted by that route's accent. */
function SoftMark({ Icon, tint = 'sage' }) {
  const reduce = useReducedMotion();
  const bg = tint === 'blush' ? 'bg-blush' : tint === 'cream' ? 'bg-cream' : 'bg-sage';
  // A drawn outer ring, a soft filled disc, then the mark. Three distinct steps
  // read as a considered figure; three stacked translucent discs read as a blob.
  const rings = [
    { s: 'h-[15.5rem] w-[15.5rem]', cls: 'border border-dashed border-moss/25' },
    { s: 'h-[11.5rem] w-[11.5rem]', cls: bg },
  ];

  return (
    <div className="relative grid h-[15.5rem] w-[15.5rem] place-items-center">
      {rings.map((r, i) => (
        <motion.span
          key={r.s}
          aria-hidden="true"
          className={'absolute rounded-full ' + r.cls + ' ' + r.s}
          initial={reduce ? false : { scale: 0.86, opacity: 0 }}
          animate={reduce ? undefined : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.06 * (rings.length - i), ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      <motion.span
        className="relative grid h-[5.25rem] w-[5.25rem] place-items-center rounded-full bg-white text-moss shadow-soft"
        initial={reduce ? false : { scale: 0.8, opacity: 0 }}
        animate={reduce ? undefined : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Icon size={32} strokeWidth={1.7} aria-hidden="true" />
      </motion.span>
    </div>
  );
}

export default function ComingSoon({ eyebrow, title, body, note, icon: Icon, tint }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = title + ', Made for Your Brand';
  }, [title]);

  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-24 pt-[calc(var(--header-h)+3.5rem)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(52rem 34rem at 50% 0%, rgba(232,240,230,.8) 0%, rgba(252,250,246,0) 65%), radial-gradient(40rem 30rem at 88% 92%, rgba(250,237,240,.85) 0%, rgba(252,250,246,0) 62%)',
        }}
      />

      <motion.div
        className="flex w-full max-w-[46rem] flex-col items-center text-center"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <SoftMark Icon={Icon} tint={tint} />

        <span className="mt-10 flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-rose" aria-hidden="true" />
          <span className="eyebrow">{eyebrow}</span>
        </span>

        <h1 className="t-1 mt-4 text-ink">{title}</h1>

        <p className="mt-6 max-w-measure text-lg text-ink-soft">{body}</p>

        <div className="mt-10 flex w-full flex-col items-center justify-center gap-3.5 sm:w-auto sm:flex-row sm:gap-4">
          <a href={contact.phoneHref} className="btn-primary w-full sm:w-auto">
            <Phone size={17} strokeWidth={2.2} aria-hidden="true" />
            Call {contact.phone}
          </a>
          <Link to="/contact" className="btn-ghost w-full sm:w-auto">
            Contact us
            <ArrowRight size={17} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </div>

        {note && (
          <p className="mt-7 font-sans text-[0.95rem] text-ink-faint">{note}</p>
        )}

        <div className="mt-14 w-full max-w-[26rem]">
          <div className="rule-soft" />
          <Link
            to="/"
            className="group mt-7 inline-flex items-center gap-2.5 font-sans text-[0.98rem] font-bold text-moss"
          >
            <ArrowLeft
              size={17}
              strokeWidth={2.2}
              className="transition-transform duration-300 group-hover:-translate-x-1"
              aria-hidden="true"
            />
            Back to the rescue story
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
