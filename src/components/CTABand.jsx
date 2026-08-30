import { Link } from 'react-router-dom';
import { ArrowRight, PawPrint } from 'lucide-react';
import Reveal from './Reveal';

export default function CTABand() {
  return (
    <section className="pb-24 sm:pb-28 lg:pb-32">
      <div className="shell">
        <Reveal amount={0.2}>
          <div className="relative overflow-hidden rounded-xl3 bg-sage px-7 py-16 text-center sm:px-12 sm:py-20 lg:py-24">
            {/* Two soft blooms keep the band from reading as a flat colour block. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(38rem 24rem at 15% 8%, rgba(255,255,255,.85) 0%, rgba(232,240,230,0) 60%), radial-gradient(34rem 22rem at 88% 96%, rgba(250,237,240,.9) 0%, rgba(232,240,230,0) 62%)',
              }}
            />

            <div className="relative">
              <span className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-white/70 text-moss shadow-soft">
                <PawPrint size={22} strokeWidth={2} aria-hidden="true" />
              </span>

              <h2 className="t-2 mx-auto mt-7 max-w-[18ch] text-moss-deep">
                Ready to give a rescue a second chance.
              </h2>

              <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
                <Link to="/adopt" className="btn-primary w-full sm:w-auto">
                  Adopt today
                  <ArrowRight size={18} strokeWidth={2.2} aria-hidden="true" />
                </Link>
                <Link to="/contact" className="btn-ghost w-full sm:w-auto">
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
