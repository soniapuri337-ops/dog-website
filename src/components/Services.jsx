import { motion } from 'framer-motion';
import {
  LifeBuoy,
  Stethoscope,
  Home,
  Syringe,
  Heart,
  Sparkles,
} from 'lucide-react';
import { services } from '../data/site';
import { stagger, item, cardItem, spring, inViewSoft } from '../lib/motion';

const icons = { LifeBuoy, Stethoscope, Home, Syringe, Heart, Sparkles };

function ServiceCard({ s }) {
  const Icon = icons[s.icon] || Heart;
  return (
    /* Entry comes from the grid's stagger (inherited, so no `initial` or
       `animate` here, which would cut the child off from the parent). The lift
       is a spring rather than a CSS ease, so a fast pointer sweep across the
       grid leaves the cards settling instead of snapping. Everything the hover
       state changes inside the card is plain CSS on `group`, which keeps the
       variant tree one level deep. */
    <motion.article
      variants={cardItem}
      whileHover={{ y: -7 }}
      whileTap={{ scale: 0.995 }}
      transition={spring}
      className="card-soft group relative h-full overflow-hidden p-7 transition-shadow duration-500 hover:border-moss/20 hover:shadow-lift sm:p-8"
    >
      <span className="grid h-[3.25rem] w-[3.25rem] place-items-center rounded-2xl bg-sage text-moss transition-all duration-500 ease-out group-hover:-rotate-3 group-hover:scale-105 group-hover:bg-moss group-hover:text-paper">
        <Icon size={24} strokeWidth={1.9} aria-hidden="true" />
      </span>

      <h3 className="t-4 relative mt-6 inline-block text-ink">
        {s.title}
        {/* The pink underline draws itself in from the left. */}
        <span
          aria-hidden="true"
          className="absolute -bottom-1.5 left-0 h-[2.5px] w-full origin-left scale-x-0 rounded-full bg-rose transition-transform duration-500 ease-out group-hover:scale-x-100"
        />
      </h3>

      <p className="t-body mt-4 text-ink-soft">{s.body}</p>
    </motion.article>
  );
}

export default function Services() {
  return (
    <section id="services" className="relative py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <div className="rule-soft" />

        <motion.div
          className="grid gap-6 pt-14 lg:grid-cols-12 lg:items-end lg:gap-10"
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={inViewSoft}
        >
          <div className="lg:col-span-7">
            <motion.span variants={item} className="flex items-center">
              <span className="mr-2.5 h-1.5 w-1.5 rounded-full bg-rose" aria-hidden="true" />
              <span className="eyebrow">What we do</span>
            </motion.span>
            <motion.h2 variants={item} className="t-2 mt-4 text-ink">
              Care for every step of the way home.
            </motion.h2>
          </div>
          <motion.div variants={item} className="lg:col-span-5">
            <p className="t-body-lg max-w-measure text-ink-soft">
              Six services, one promise. Whatever an animal needs on the day we meet
              them, there is a team ready for it.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6"
          variants={stagger(0.07)}
          initial="hidden"
          whileInView="show"
          viewport={inViewSoft}
        >
          {services.map((s) => (
            <ServiceCard key={s.title} s={s} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
