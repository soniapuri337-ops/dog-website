import { motion, useReducedMotion } from 'framer-motion';

/* One shared reveal so every section enters the page with the same manners. */
export default function Reveal({
  children,
  delay = 0,
  y = 26,
  className = '',
  as = 'div',
  once = true,
  amount = 0.25,
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
