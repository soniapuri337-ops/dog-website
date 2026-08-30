import { motion } from 'framer-motion';
import { Clock, HeartHandshake, Users } from 'lucide-react';
import { promises } from '../data/site';
import { stagger, item, inViewSoft, EASE } from '../lib/motion';

const icons = { Clock, HeartHandshake, Users };

/* A short landing strip between the film and the page. It gives the story
   somewhere to settle before the reviews begin. */
export default function Promises() {
  return (
    <section className="relative bg-paper py-16 sm:py-20 lg:py-24">
      <div className="shell">
        <motion.div
          className="grid gap-9 sm:grid-cols-3 sm:gap-7 lg:gap-14"
          variants={stagger(0.11)}
          initial="hidden"
          whileInView="show"
          viewport={inViewSoft}
        >
          {promises.map((p) => {
            const Icon = icons[p.icon] || Clock;
            return (
              <motion.div key={p.title} variants={item} className="flex flex-col">
                <span className="flex items-center">
                  <Icon size={21} strokeWidth={1.9} className="mr-3 shrink-0 text-moss" aria-hidden="true" />
                  {/* The rule draws itself across as the item arrives. */}
                  <motion.span
                    aria-hidden="true"
                    className="h-px flex-1 origin-left bg-moss/20"
                    variants={{
                      hidden: { scaleX: 0 },
                      show: { scaleX: 1, transition: { duration: 0.9, ease: EASE, delay: 0.15 } },
                    }}
                  />
                </span>
                <h3 className="t-4 mt-5 text-ink">{p.title}</h3>
                <p className="t-body mt-2.5 text-ink-soft">{p.body}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
