/* Shared motion language. Every section enters the page with the same manners,
   so the page reads as one piece rather than a pile of separate effects. */

// The house easing curve. Slow out, long settle.
export const EASE = [0.22, 1, 0.36, 1];
export const EASE_SOFT = [0.33, 1, 0.68, 1];

export const spring = { type: 'spring', stiffness: 260, damping: 26, mass: 0.9 };
export const springSoft = { type: 'spring', stiffness: 180, damping: 24, mass: 1 };

/* A parent that releases its children one after another. Pair with `item`. */
export const stagger = (gap = 0.08, delay = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: gap, delayChildren: delay },
  },
});

export const item = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: EASE },
  },
};

/* Cards rise a little further and settle on a spring, so a grid of them reads
   as physical objects landing rather than opacity fading in. */
export const cardItem = {
  hidden: { opacity: 0, y: 34, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.78, ease: EASE },
  },
};

/* Display lines lift from a slight mask. */
export const lineItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/* Route level transition. Short enough not to feel like a page load. */
export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: EASE_SOFT } },
};

/* Standard viewport options: fire once, a quarter of the way in. */
export const inView = { once: true, amount: 0.2 };
export const inViewSoft = { once: true, amount: 0.12 };
