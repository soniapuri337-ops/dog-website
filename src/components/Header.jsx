import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, PawPrint, ArrowRight } from 'lucide-react';
import { brand, navLinks, contact } from '../data/site';
import { scrollToHash, getLenis } from '../lib/scroll';

function BrandLockup({ compact = false, showTagline = true }) {
  const [logoFailed, setLogoFailed] = useState(false);
  return (
    <span className="flex items-center gap-3">
      {/* Logo slot. Replace /public/brand/logo.svg with your own file. If it ever
          goes missing the lockup falls back to the paw mark instead of breaking. */}
      <span
        className={
          'grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-moss text-paper transition-all duration-500 ' +
          (compact ? 'h-9 w-9' : 'h-11 w-11')
        }
      >
        {logoFailed ? (
          <PawPrint size={compact ? 17 : 20} strokeWidth={2.2} aria-hidden="true" />
        ) : (
          <img
            src={brand.logo}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            onError={() => setLogoFailed(true)}
          />
        )}
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={
            'whitespace-nowrap font-display font-semibold text-ink transition-all duration-500 ' +
            (compact ? 'text-[0.96rem] sm:text-[1.02rem]' : 'text-[1.04rem] sm:text-[1.14rem]')
          }
          style={{ letterSpacing: '-0.02em' }}
        >
          {brand.name}
        </span>
        {showTagline && (
          <span className="mt-1 hidden whitespace-nowrap font-sans text-[0.52rem] font-bold uppercase tracking-[0.12em] text-ink-faint xs:block sm:text-[0.63rem] sm:tracking-[0.16em]">
            {brand.tagline}
          </span>
        )}
      </span>
    </span>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      if (open) lenis.stop(); else lenis.start();
      return () => lenis.start();
    }
    // No Lenis (reduced motion): fall back to a plain lock.
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);

  const go = (e, href) => {
    setOpen(false);
    if (!href.includes('#')) return; // let the router handle real routes
    e.preventDefault();
    if (onHome) {
      scrollToHash(href);
    } else {
      navigate('/', { state: { hash: href.split('#')[1] } });
    }
  };

  return (
    <>
      <header
        className={
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out ' +
          (scrolled
            ? 'border-b border-moss/10 bg-paper/82 shadow-soft backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent')
        }
      >
        <div className="shell">
          <div
            className={
              'flex items-center justify-between transition-all duration-500 ease-out ' +
              (scrolled ? 'py-2.5' : 'py-4')
            }
          >
            <Link to="/" onClick={() => setOpen(false)} className="rounded-2xl">
              <BrandLockup compact={scrolled} />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={(e) => go(e, l.href)}
                  className="rounded-full px-4 py-2 font-sans text-[0.94rem] font-semibold text-ink-soft transition-colors duration-300 hover:bg-sage hover:text-moss"
                >
                  {l.label}
                </a>
              ))}
              <Link to="/adopt" className="btn-primary ml-3">
                Adopt today
              </Link>
            </nav>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="grid h-11 w-11 place-items-center rounded-full border border-moss/20 bg-white/70 text-moss backdrop-blur-md transition-colors hover:bg-white lg:hidden"
            >
              <Menu size={19} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 h-full w-full cursor-default bg-ink/25 backdrop-blur-sm"
              variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
              transition={{ duration: 0.35 }}
            />
            <motion.aside
              className="absolute right-0 top-0 flex h-full w-[min(88vw,26rem)] flex-col bg-paper px-7 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6 shadow-lift"
              variants={{
                open: { x: 0 },
                closed: { x: '100%' },
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            >
              <div className="flex items-center justify-between">
                <BrandLockup compact showTagline={false} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-11 w-11 place-items-center rounded-full border border-moss/20 bg-white text-moss"
                >
                  <X size={19} strokeWidth={2.2} aria-hidden="true" />
                </button>
              </div>

              <nav className="mt-10 flex flex-col" aria-label="Mobile">
                {navLinks.map((l, i) => (
                  <motion.a
                    key={l.label}
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    className="group flex items-center justify-between border-b border-moss/10 py-4 font-display text-[1.6rem] font-medium text-ink"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.4 }}
                  >
                    {l.label}
                    <ArrowRight
                      size={19}
                      strokeWidth={2}
                      className="text-rose transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </motion.a>
                ))}
              </nav>

              <div className="mt-auto pt-10">
                <Link to="/adopt" onClick={() => setOpen(false)} className="btn-primary w-full">
                  Adopt today
                </Link>
                <a
                  href={contact.phoneHref}
                  className="mt-4 block text-center font-sans text-[1.02rem] font-bold text-moss"
                >
                  {contact.phone}
                </a>
                <a
                  href={'mailto:' + contact.email}
                  className="mt-1.5 block text-center font-sans text-[0.92rem] font-semibold text-ink-soft"
                >
                  {contact.email}
                </a>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
