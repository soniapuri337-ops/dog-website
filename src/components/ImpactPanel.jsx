import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Sprout } from 'lucide-react';
import { impact } from '../data/site';
import { stagger, item, EASE } from '../lib/motion';

/* A number that rolls up to its value the first time it is seen. Driven by a
   spring on a motion value, so it never re-renders React while it counts. */
function Tally({ value, suffix = '', active }) {
  const reduce = useReducedMotion();
  const target = Number(value) || 0;
  const spring = useSpring(0, { stiffness: 70, damping: 22, mass: 1 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString());
  const [text, setText] = useState(reduce ? String(target) : '0');

  useEffect(() => {
    if (reduce) { setText(String(target)); return undefined; }
    if (active) spring.set(target);
    return rounded.on('change', (v) => setText(v));
  }, [active, target, reduce, spring, rounded]);

  return (
    <span className="font-display tabular-nums">
      {text}
      {suffix}
    </span>
  );
}

export default function ImpactPanel() {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });

  return (
    <motion.aside
      ref={ref}
      className="relative overflow-hidden rounded-xl3 border border-moss/12 bg-cream p-7 shadow-soft sm:p-8"
      variants={stagger(0.1, 0.05)}
      initial="hidden"
      animate={seen ? 'show' : 'hidden'}
    >
      {/* A quiet arc in the corner, the same gesture as the rings on the coming
          soon pages. Decoration that repeats is a system; decoration that
          appears once is noise. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full border border-moss/15"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full border border-rose/15"
      />

      <motion.div variants={item} className="relative flex items-center">
        <span className="mr-3 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage text-moss">
          <Sprout size={17} strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="eyebrow">Our record</span>
      </motion.div>

      <dl className="relative mt-6">
        {impact.map((row, i) => (
          <motion.div
            key={row.label}
            variants={item}
            className={
              'flex items-baseline justify-between py-3.5 ' +
              (i > 0 ? 'border-t border-moss/10' : '')
            }
          >
            <dt className="mr-4 t-small max-w-[19ch] text-ink-soft">{row.label}</dt>
            <dd className="shrink-0 text-[1.72rem] font-semibold leading-none text-moss">
              <Tally value={row.value} suffix={row.suffix} active={seen} />
            </dd>
          </motion.div>
        ))}
      </dl>

      <motion.p
        variants={item}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative mt-5 border-t border-moss/10 pt-5 t-small text-ink-soft"
      >
        Every number here started with someone picking up the phone.
      </motion.p>
    </motion.aside>
  );
}
