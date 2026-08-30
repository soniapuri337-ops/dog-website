import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  PawPrint,
} from 'lucide-react';
import { brand, contact, footerLinks } from '../data/site';

/* Placeholder profiles. Swap in your real handles. */
const socials = [
  { Icon: Instagram, label: 'Instagram', href: 'https://instagram.com/' },
  { Icon: Facebook, label: 'Facebook', href: 'https://facebook.com/' },
  { Icon: Youtube, label: 'YouTube', href: 'https://youtube.com/' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-cream">
      <div className="shell py-20 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <span className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-moss text-paper">
                <PawPrint size={20} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <span className="flex flex-col leading-none">
                <span
                  className="font-display text-[1.14rem] font-semibold text-ink"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {brand.name}
                </span>
                <span className="mt-1 font-sans text-[0.63rem] font-bold uppercase tracking-[0.16em] text-ink-faint">
                  {brand.tagline}
                </span>
              </span>
            </span>

            <p className="font-display t-3 mt-7 max-w-[30ch] text-moss">
              Every rescue deserves a happy ending.
            </p>
            <p className="mt-3 max-w-measure text-[1.02rem] text-ink-soft">
              {contact.hours}. If you have found an animal in distress, call us and we
              will come.
            </p>

            <div className="mt-8 flex gap-2.5">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-full border border-moss/15 bg-white/70 text-moss transition-all duration-300 hover:-translate-y-0.5 hover:border-moss/40 hover:bg-white"
                >
                  <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav className="lg:col-span-3" aria-label="Quick links">
            <h2 className="font-sans text-[0.72rem] font-extrabold uppercase tracking-[0.19em] text-ink-faint">
              Quick links
            </h2>
            <ul className="mt-6 flex flex-col gap-3.5">
              {footerLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="group inline-flex items-center gap-2 font-sans text-[1.02rem] font-semibold text-ink-soft transition-colors duration-300 hover:text-moss"
                  >
                    <span className="h-1 w-1 rounded-full bg-rose opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <h2 className="font-sans text-[0.72rem] font-extrabold uppercase tracking-[0.19em] text-ink-faint">
              Get in touch
            </h2>
            <ul className="mt-6 flex flex-col gap-4">
              <li>
                <a
                  href={'mailto:' + contact.email}
                  className="flex items-start gap-3 font-sans text-[1.02rem] font-semibold text-ink-soft transition-colors duration-300 hover:text-moss"
                >
                  <Mail size={18} strokeWidth={1.9} className="mt-1 shrink-0 text-moss" aria-hidden="true" />
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  href={contact.phoneHref}
                  className="flex items-start gap-3 font-sans text-[1.02rem] font-semibold text-ink-soft transition-colors duration-300 hover:text-moss"
                >
                  <Phone size={18} strokeWidth={1.9} className="mt-1 shrink-0 text-moss" aria-hidden="true" />
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-3 font-sans text-[1.02rem] text-ink-soft">
                <MapPin size={18} strokeWidth={1.9} className="mt-1 shrink-0 text-moss" aria-hidden="true" />
                {contact.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 h-px w-full bg-moss/12" />

        <div className="mt-7 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="font-sans text-[0.92rem] font-semibold text-ink-soft">
            This site can be yours, {year}.
          </p>
          <p className="font-sans text-[0.86rem] text-ink-faint">
            A demo brand. All names, numbers and photographs are placeholders.
          </p>
        </div>
      </div>
    </footer>
  );
}
