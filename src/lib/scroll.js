let instance = null;

export function setLenis(l) {
  instance = l;
}

export function getLenis() {
  return instance;
}

/* Scroll to an element by hash, through Lenis when it is running so the motion
   keeps the same inertia as the rest of the page. */
export function scrollToHash(hash, offset = -72) {
  const id = String(hash || '').replace(/^.*#/, '');
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.4 });
    return true;
  }
  // Lenis only exists when motion is allowed, so this path jumps rather than glides.
  const y = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: y, behavior: 'auto' });
  return true;
}
