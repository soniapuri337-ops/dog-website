import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Star } from 'lucide-react';
import { reviews, reviewSummary } from '../data/site';
import { stagger, item, cardItem, spring, inViewSoft } from '../lib/motion';
import ImpactPanel from './ImpactPanel';

const washes = ['bg-sage text-moss', 'bg-blush text-rose-ink', 'bg-cream text-ink-soft'];

function initials(name) {
  return name
    .replace(/[^A-Za-z ]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/* Avatar slot. Drop a square image in /public/avatars and point the review at it.
   If the file is missing the card falls back to initials on a soft wash. */
function Avatar({ src, name, size = 'h-12 w-12', i = 0 }) {
  const [failed, setFailed] = useState(false);
  const wash = washes[i % washes.length];
  return (
    <span
      className={
        'grid shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-inset ring-moss/10 ' +
        size + ' ' + (failed || !src ? wash : 'bg-cream')
      }
    >
      {failed || !src ? (
        <span className="font-display text-[0.9em] font-semibold leading-none">
          {initials(name)}
        </span>
      ) : (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

function Stars({ n = 5, size = 15 }) {
  return (
    <span className="flex items-center" aria-label={n + ' out of 5 stars'}>
      {Array.from({ length: n }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={0}
          className="mr-[3px] fill-rose"
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

/* The featured quote carries one highlighted phrase, drawn as a soft rose wash
   sitting behind the words rather than a flat marker line. */
function HighlightedQuote({ quote, highlight }) {
  if (!highlight || quote.indexOf(highlight) === -1) return <>{quote}</>;
  const parts = quote.split(highlight);
  return (
    <>
      {parts[0]}
      <span
        className="-mx-[0.12em] rounded-[0.3em] bg-rose-soft/75 px-[0.12em]"
        style={{ boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
      >
        {highlight}
      </span>
      {parts[1]}
    </>
  );
}

function ReviewCard({ r, i }) {
  return (
    <motion.article
      variants={cardItem}
      whileHover={{ y: -6 }}
      transition={spring}
      className="card-soft group relative flex h-full flex-col p-6 sm:p-7"
    >
      <Stars n={r.stars} />
      <p className="font-display mb-6 mt-4 text-[1.08rem] font-medium leading-[1.46] text-ink xl:text-[1.18rem]">
        {r.quote}
      </p>
      <div className="mt-auto flex items-center border-t border-moss/10 pt-5">
        <Avatar src={r.avatar} name={r.name} i={i} />
        <span className="ml-3.5 flex min-w-0 flex-col leading-tight">
          <span className="font-sans text-[0.97rem] font-extrabold text-ink">{r.name}</span>
          <span className="truncate font-sans text-[0.83rem] font-semibold text-ink-faint">
            {r.role}
          </span>
        </span>
      </div>
    </motion.article>
  );
}

export default function Reviews() {
  const featured = reviews.find((r) => r.featured) || reviews[0];
  const rest = reviews.filter((r) => r !== featured);
  const sectionRef = useRef(null);
  const reduce = useReducedMotion();

  /* The colour blooms drift a little slower than the page, so the section has
     depth without anything actually moving on its own. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bloomY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="relative overflow-hidden py-20 sm:py-24 lg:py-32"
    >
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { y: bloomY }}
        className="pointer-events-none absolute -inset-y-16 inset-x-0 -z-10"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60rem 40rem at 78% 12%, rgba(250,237,240,.95) 0%, rgba(252,250,246,0) 62%), radial-gradient(48rem 34rem at 4% 86%, rgba(232,240,230,.9) 0%, rgba(252,250,246,0) 64%)',
          }}
        />
      </motion.div>

      <div className="shell">
        <motion.div
          className="grid gap-7 lg:grid-cols-12 lg:items-end"
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={inViewSoft}
        >
          <div className="lg:col-span-7">
            <motion.span variants={item} className="flex items-center">
              <span className="mr-2.5 h-1.5 w-1.5 rounded-full bg-rose" aria-hidden="true" />
              <span className="eyebrow">Reviews</span>
            </motion.span>
            <motion.h2 variants={item} className="t-2 mt-4 text-ink">
              Kind words from kind people.
            </motion.h2>
            <motion.p variants={item} className="t-body-lg mt-5 max-w-measure text-ink-soft">
              A few notes from the people who took one of ours home, and from the
              volunteers who helped get them there.
            </motion.p>
          </div>

          <motion.div variants={item} className="lg:col-span-5 lg:justify-self-end">
            <div className="inline-flex items-center rounded-full border border-moss/15 bg-white/85 px-5 py-3 shadow-soft">
              <span className="font-display mr-4 text-[1.9rem] font-semibold leading-none text-moss">
                {reviewSummary.score}
              </span>
              <span className="flex flex-col leading-none">
                <Stars n={5} size={14} />
                <span className="mt-1.5 font-sans text-[0.8rem] font-semibold text-ink-soft">
                  {reviewSummary.count} {reviewSummary.label}
                </span>
              </span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-11 grid gap-6 lg:mt-14 lg:grid-cols-12 lg:gap-7"
          variants={stagger(0.09)}
          initial="hidden"
          whileInView="show"
          viewport={inViewSoft}
        >
          {/* Left column: the featured note, then the record panel that closes it off. */}
          <div className="flex flex-col lg:col-span-5">
            <motion.article
              variants={cardItem}
              className="relative mb-6 overflow-hidden rounded-xl3 border border-rose/25 bg-blush p-7 shadow-soft sm:p-9 lg:mb-7"
            >
              <Stars n={featured.stars} size={17} />
              <p className="font-display t-3 relative mt-5 text-ink">
                <HighlightedQuote quote={featured.quote} highlight={featured.highlight} />
              </p>
              <div className="mt-9 flex items-center">
                <Avatar
                  src={featured.avatar}
                  name={featured.name}
                  size="h-14 w-14 text-[1.05rem]"
                  i={1}
                />
                <span className="ml-4 flex flex-col leading-tight">
                  <span className="font-sans text-[1.02rem] font-extrabold text-ink">
                    {featured.name}
                  </span>
                  <span className="font-sans text-[0.85rem] font-semibold text-rose-ink">
                    {featured.role}
                  </span>
                </span>
              </div>
            </motion.article>

            <motion.div variants={cardItem} className="flex flex-1 flex-col">
              <ImpactPanel />
            </motion.div>
          </div>

          {/* Right column: the rest, staggered so the grid breathes. */}
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7 lg:gap-7">
            {rest.map((r, i) => (
              <div key={r.name} className={i % 2 === 1 ? 'sm:mt-9 lg:mt-12' : ''}>
                <ReviewCard r={r} i={i} />
              </div>
            ))}

            {/* A quiet closing note rather than a fourth identical card. */}
            <motion.div variants={cardItem} className="sm:mt-9 lg:mt-12">
              <div className="flex h-full flex-col justify-center rounded-xl2 border border-dashed border-moss/25 bg-sage/45 p-7 text-center">
                <p className="font-display text-[1.22rem] font-medium leading-snug text-moss">
                  Adopted from us?
                </p>
                <p className="t-small mt-2 text-ink-soft">
                  Tell us how they are doing. We read every note.
                </p>
                <Link
                  to="/contact"
                  className="mt-5 inline-flex items-center justify-center self-center rounded-full border border-moss/25 bg-white px-5 py-2.5 font-sans text-[0.9rem] font-bold text-moss transition-all duration-300 hover:-translate-y-0.5 hover:border-moss/50"
                >
                  Share your story
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
