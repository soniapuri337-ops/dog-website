import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { buildScenes } from '../data/site';
import { scrollToHash } from '../lib/scroll';
import RescueBadge from './RescueBadge';

gsap.registerPlugin(ScrollTrigger);

const SCROLL_VH_DESKTOP = 640; // scroll distance the film is scrubbed across
const SCROLL_VH_TABLET = 560;
const SCROLL_VH_MOBILE = 500;
const SCROLL_VH_REDUCED = 220; // no video, so the story does not need the runway

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const smooth = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

const mq = (q) =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(q).matches;

const isTouch = () =>
  mq('(pointer: coarse)') || (typeof window !== 'undefined' && window.innerWidth <= 900);

/* The portrait film is only right for a portrait screen. A tablet held in
   landscape is a touch device but still wants the 16:9 cut, otherwise
   object-cover crops a 9:16 file down to a sliver. */
const wantsPortraitFilm = () =>
  isTouch() && typeof window !== 'undefined' && window.innerHeight >= window.innerWidth;

export default function ScrollStory() {
  const { scenes } = useMemo(() => buildScenes(), []);
  const trackRef = useRef(null);
  const videoRef = useRef(null);
  const posterRef = useRef(null);
  const captionRefs = useRef([]);
  const tickRefs = useRef([]);
  const railFillRef = useRef(null);
  const barFillRef = useRef(null);
  const cueRef = useRef(null);

  const target = useRef(0); // where scroll says we are, 0 to 1
  const current = useRef(0); // where the decoder actually is, eased
  const ready = useRef(false);
  const primed = useRef(false);

  const [loadPct, setLoadPct] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [activeScene, setActiveScene] = useState(0);
  // Decided once at mount so a desktop window resize never swaps the film mid scroll.
  const [poster] = useState(() =>
    wantsPortraitFilm() ? '/hero/poster-mobile.jpg' : '/hero/poster.jpg',
  );

  const reduce = mq('(prefers-reduced-motion: reduce)');

  /* 1. Get the film playing as soon as possible.
     The original build downloaded the whole 18 MB master into a Blob before a
     single frame could be scrubbed. That guarantees seekability, but on a real
     connection it also means many seconds where scrolling moves the captions
     over a completely static poster, which reads as a broken scrub.

     A CDN answers HTTP range requests, so the browser can stream the file and
     seek into it straight away. One 1 byte probe tells us which world we are in:
       206  -> stream it natively, scrubbing starts almost immediately
       else -> fall back to the Blob, which is always seekable
     The Blob path is what saves hosts (and file:// ) that ignore Range. */
  useEffect(() => {
    if (reduce) return undefined;
    // H.264 is the scrub source everywhere: it is universally decodable and
    // seeks fastest. The VP9 file is the fallback if the mp4 cannot be fetched.
    const sources = wantsPortraitFilm()
      ? ['/hero/master-mobile.mp4', '/hero/master.webm']
      : ['/hero/master.mp4', '/hero/master.webm'];
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let objectUrl;
    let cancelled = false;

    const attachHandlers = (v) => {
      v.addEventListener('loadedmetadata', () => {
        ready.current = true;
        setLoaded(true);
      });
      // iOS keeps a muted, never played video blank even after a seek, so the
      // poster stays up until a real frame has actually painted.
      v.addEventListener(
        'seeked',
        () => {
          if (posterRef.current) posterRef.current.style.opacity = '0';
        },
        { once: true },
      );
      v.addEventListener('loadeddata', () => {
        try { v.pause(); } catch (e) { /* no op */ }
        if (primed.current) prime(v);
      });
      // Report how much is buffered rather than how much has downloaded: with
      // streaming those are the same thing, and it is what actually gates a seek.
      v.addEventListener('progress', () => {
        try {
          if (v.buffered.length && v.duration) {
            setLoadPct(Math.round((v.buffered.end(v.buffered.length - 1) / v.duration) * 100));
          }
        } catch (e) { /* no op */ }
      });
    };

    const loadAsBlob = async (url) => {
      const res = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
      // Throw rather than return, so the caller's catch can try the next source.
      if (!res.ok) throw new Error(String(res.status));
      if (cancelled) return;
      const total = Number(res.headers.get('content-length')) || 0;
      const reader = res.body && res.body.getReader ? res.body.getReader() : null;
      let blob;

      if (reader && total) {
        const chunks = [];
        let got = 0;
        for (;;) {
          const step = await reader.read();
          if (step.done) break;
          chunks.push(step.value);
          got += step.value.length;
          setLoadPct(Math.round((got / total) * 100));
        }
        blob = new Blob(chunks, {
          type: url.indexOf('.webm') !== -1 ? 'video/webm' : 'video/mp4',
        });
      } else {
        // Safari 12 has no streaming body reader, so it takes the whole blob.
        blob = await res.blob();
        setLoadPct(100);
      }
      if (cancelled) return;
      const v = videoRef.current;
      if (!v) return;
      objectUrl = URL.createObjectURL(blob);
      attachHandlers(v);
      v.src = objectUrl;
    };

    (async () => {
      const url = sources[0];
      const v = videoRef.current;
      if (!v) return;

      let supportsRanges = false;
      try {
        const probe = await fetch(url, {
          headers: { Range: 'bytes=0-0' },
          signal: ctrl ? ctrl.signal : undefined,
        });
        supportsRanges = probe.status === 206;
      } catch (e) {
        if (cancelled) return;
      }
      if (cancelled) return;

      if (supportsRanges) {
        attachHandlers(v);
        v.src = url; // the browser streams and seeks natively from here
        return;
      }

      // No range support: fall back to the Blob, and to the webm if the mp4 is
      // missing entirely.
      try {
        await loadAsBlob(sources[0]);
      } catch (e) {
        try { await loadAsBlob(sources[1]); } catch (e2) {
          /* Poster stays up and the captions still play. The story never breaks. */
        }
      }
    })();

    return () => {
      cancelled = true;
      if (ctrl) ctrl.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reduce]);

  /* 2. iOS priming: a muted video needs one gesture before it will paint. */
  function prime(v) {
    if (!isTouch() || !v) return;
    try {
      const p = v.play();
      if (p && p.then) {
        p.then(() => { try { v.pause(); } catch (e) { /* no op */ } }).catch(() => {});
      }
    } catch (e) { /* no op */ }
  }

  useEffect(() => {
    const onGesture = () => {
      if (primed.current) return;
      primed.current = true;
      prime(videoRef.current);
    };
    window.addEventListener('pointerdown', onGesture, { once: true, passive: true });
    window.addEventListener('touchstart', onGesture, { once: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('touchstart', onGesture);
    };
  }, []);

  /* 3. Scroll drives film time. */
  useLayoutEffect(() => {
    const st = ScrollTrigger.create({
      trigger: trackRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => { target.current = self.progress; },
      onRefresh: (self) => { target.current = self.progress; },
    });

    let raf = 0;
    let lastActive = -1;
    const last = scenes.length - 1;

    function tick() {
      raf = requestAnimationFrame(tick);
      const t = target.current;

      // Ease toward the scroll target so a flick reads as a glide, not a jump.
      current.current += (t - current.current) * (reduce ? 1 : 0.16);
      const p = current.current;

      const v = videoRef.current;
      // Never queue a seek while the decoder is still resolving the last one.
      // On a phone a fast flick would otherwise pile up seeks and freeze the film.
      if (v && ready.current && !v.seeking) {
        const dur = v.duration || 1;
        let time = clamp(p, 0, 0.9995) * dur;

        // While the film is still streaming, never seek past what is actually
        // buffered. Asking for an unbuffered frame stalls the decoder until the
        // network answers, which is exactly the hitch this is here to avoid.
        // Holding at the buffer edge instead just pauses the picture for a
        // moment while the copy keeps moving.
        try {
          if (v.buffered.length) {
            const bufferedEnd = v.buffered.end(v.buffered.length - 1);
            if (time > bufferedEnd - 0.1) time = Math.max(0, bufferedEnd - 0.1);
          }
        } catch (e) { /* no op */ }

        // One frame is the finest step that can change what is on screen, so
        // anything smaller is a decode we throw away. The old value was 8ms
        // against a 33ms frame, which meant seeking roughly four times per
        // visible change.
        const frame = 1 / 24; // the film's real frame rate, matching scripts/grade.sh
        const eps = isTouch() ? frame * 1.5 : frame * 0.9;
        if (Math.abs(v.currentTime - time) > eps) {
          try { v.currentTime = time; } catch (e) { /* decoder busy */ }
        }
      }

      // Captions: one scene owns the screen at a time.
      let near = 0;
      for (let i = 0; i < scenes.length; i += 1) {
        const s = scenes[i];
        const el = captionRefs.current[i];
        if (!el) continue;
        const span = s.to - s.from || 1;
        const local = (p - s.from) / span;
        let a = 0;
        if (local >= -0.4 && local <= 1.4) {
          const inA = i === 0 ? 1 : smooth(local / 0.2);
          const outA = i === last ? 1 : smooth((1 - local) / 0.2);
          a = Math.min(inA, outA);
        }
        el.style.opacity = a.toFixed(3);
        el.style.transform = reduce
          ? 'none'
          : 'translate3d(0,' + ((1 - a) * 28 * (local > 0.5 ? -1 : 1)).toFixed(2) + 'px,0)';
        // Hidden captions must not sit in the tab order or catch a stray tap.
        el.style.visibility = a < 0.004 ? 'hidden' : 'visible';
        el.style.pointerEvents = a > 0.6 ? 'auto' : 'none';
        if (p >= s.from - 0.004) near = i;
      }

      if (railFillRef.current) {
        railFillRef.current.style.transform = 'scaleY(' + clamp(t).toFixed(4) + ')';
      }
      if (barFillRef.current) {
        barFillRef.current.style.transform = 'scaleX(' + clamp(t).toFixed(4) + ')';
      }
      if (cueRef.current) {
        cueRef.current.style.opacity = clamp(1 - t / 0.045).toFixed(3);
      }
      if (near !== lastActive) {
        lastActive = near;
        setActiveScene(near);
        for (let k = 0; k < tickRefs.current.length; k += 1) {
          const el = tickRefs.current[k];
          if (el) el.setAttribute('data-active', String(k === near));
        }
      }
    }

    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

    /* The loop only runs while the film is on screen. Leaving a per frame loop
       running under the rest of the page is exactly the kind of thing that shows
       up as scroll jank in the sections below. */
    let io = null;
    if (typeof IntersectionObserver !== 'undefined' && trackRef.current) {
      io = new IntersectionObserver(
        (entries) => {
          let on = false;
          for (let i = 0; i < entries.length; i += 1) if (entries[i].isIntersecting) on = true;
          if (on) start(); else stop();
        },
        { rootMargin: '20% 0px' },
      );
      io.observe(trackRef.current);
    }
    start();

    return () => { if (io) io.disconnect(); stop(); st.kill(); };
  }, [scenes, reduce]);

  const scrollVh = reduce
    ? SCROLL_VH_REDUCED
    : isTouch()
      ? (typeof window !== 'undefined' && window.innerWidth >= 700
        ? SCROLL_VH_TABLET
        : SCROLL_VH_MOBILE)
      : SCROLL_VH_DESKTOP;

  return (
    <section
      id="story"
      ref={trackRef}
      className="relative"
      style={{ height: 'calc(var(--vh-full) + ' + scrollVh + 'vh)' }}
      aria-label="The rescue story"
    >
      {/* The sticky stage. CSS sticky rather than a transform pin: a phone URL bar
          sliding away resizes the viewport constantly, and sticky simply reflows
          where a pin recalculates and yanks the scroll position. */}
      <div
        className="sticky-safe top-0 w-full overflow-hidden bg-cream"
        style={{ height: 'var(--vh-full)' }}
      >
        <div className="absolute inset-0">
          {/* The poster matches the clip that will actually play, so a phone never
              flashes a landscape frame before the portrait film paints. */}
          <img
            ref={posterRef}
            src={poster}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          />
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* Legibility, always by adding light rather than darkness. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[30%]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(252,250,246,.94) 0%, rgba(252,250,246,.44) 46%, rgba(252,250,246,0) 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[74%]"
          style={{
            background:
              'linear-gradient(to top, rgba(252,250,246,.95) 0%, rgba(252,250,246,.86) 22%, rgba(252,250,246,.56) 44%, rgba(252,250,246,.18) 70%, rgba(252,250,246,0) 100%)',
          }}
        />
        {/* A wash anchored to the bottom left corner, exactly where the type sits.
            It lifts the copy off whatever the film is showing without flattening
            the subject, which usually sits centre frame. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(105% 62% at 0% 100%, rgba(252,250,246,.80) 0%, rgba(252,250,246,.54) 34%, rgba(252,250,246,.16) 64%, rgba(252,250,246,0) 86%)',
          }}
        />

        {/* Captions. The padding lives on the flex container, not the relative
            wrapper: padding never moves an absolutely positioned child. */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <div
            className="shell flex h-full items-end"
            style={{ paddingBottom: 'calc(5.25rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="relative w-full sm:pb-3 lg:pb-5">
              {scenes.map((s, i) => (
                <figure
                  key={s.id}
                  ref={(el) => { captionRefs.current[i] = el; }}
                  className="absolute bottom-0 left-0 w-full opacity-0 will-change-[opacity,transform]"
                >
                  <figcaption>
                    <span className="story-chip">
                      <span className="live-dot" aria-hidden="true" />
                      <span className="eyebrow whitespace-nowrap">{s.eyebrow}</span>
                    </span>

                    {/* The opening line doubles as the page heading, so the page
                        has a real h1 that matches what a visitor actually reads. */}
                    {i === 0 ? (
                      <h1 className="font-display t-1 mt-4 max-w-[15ch] text-ink sm:mt-5">
                        {s.line}
                      </h1>
                    ) : (
                      <p className="font-display t-1 mt-4 max-w-[15ch] text-ink sm:mt-5">
                        {s.line}
                      </p>
                    )}

                    {s.cta && (
                      <a
                        href={s.cta.href}
                        onClick={(e) => {
                          // Hand the jump to Lenis so it keeps the page's inertia.
                          if (scrollToHash(s.cta.href)) e.preventDefault();
                        }}
                        className="btn-primary pointer-events-auto mt-6 sm:mt-7"
                      >
                        <span>{s.cta.label}</span>
                        <ArrowRight size={18} strokeWidth={2.2} aria-hidden="true" />
                      </a>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>

        {/* Progress rail, on its own frosted panel so the labels read against any
            frame of the film. */}
        <div
          className="pointer-events-none absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 sm:block lg:right-6"
          aria-hidden="true"
        >
          <div className="frost rounded-[1.6rem] border border-moss/12 py-4 pl-4 pr-3.5 shadow-soft">
            <div className="relative flex flex-col items-end">
              <div className="absolute right-[4px] top-2 bottom-2 w-px bg-ink/15" />
              <div
                ref={railFillRef}
                className="absolute right-[4px] top-2 bottom-2 w-px origin-top bg-moss"
                style={{ transform: 'scaleY(0)' }}
              />
              {scenes.map((s, i) => (
                <div
                  key={s.id}
                  ref={(el) => { tickRefs.current[i] = el; }}
                  data-active="false"
                  className="group relative flex items-center justify-end py-[7px] opacity-60 transition-opacity duration-500 data-[active=true]:opacity-100"
                >
                  <span className="mr-3 font-sans text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-ink-faint transition-colors duration-500 group-data-[active=true]:text-moss">
                    {s.label}
                  </span>
                  <span className="flex h-2.5 w-2.5 items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink/25 transition-all duration-500 group-data-[active=true]:h-2.5 group-data-[active=true]:w-2.5 group-data-[active=true]:bg-moss" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* On phones the rail becomes a hairline on the very bottom edge of the
            stage. A row of dots down there fought the badge for space on a 320
            wide screen; an edge bar cannot collide with anything. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] bg-ink/10 sm:hidden"
          aria-hidden="true"
        >
          <div
            ref={barFillRef}
            className="h-full w-full origin-left bg-moss"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>

        {/* The scene name, so the phone still knows where it is in the story. */}
        <div
          className="pointer-events-none absolute right-4 z-20 sm:hidden"
          style={{ bottom: 'calc(3.6rem + env(safe-area-inset-bottom, 0px))' }}
          aria-hidden="true"
        >
          <span className="font-sans text-[0.56rem] font-extrabold uppercase tracking-[0.22em] text-moss/70">
            {scenes[activeScene] ? scenes[activeScene].label : ''}
          </span>
        </div>

        <RescueBadge />

        {/* Scroll cue */}
        {/* Bottom left on tablets, centred once there is room. Centred at 768 it
            sat right against the badge, which is anchored bottom right. */}
        <div
          ref={cueRef}
          className="pointer-events-none absolute left-5 z-20 hidden justify-start sm:left-7 sm:flex lg:inset-x-0 lg:justify-center"
          style={{ bottom: 'calc(1.7rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <span className="frost flex items-center rounded-full px-4 py-2 font-sans text-[0.66rem] font-extrabold uppercase tracking-[0.2em] text-ink-soft shadow-soft">
            <ArrowDown size={13} strokeWidth={2.6} className="mr-2 animate-bounce" aria-hidden="true" />
            Scroll to follow the story
          </span>
        </div>

        {/* Loading line */}
        {!loaded && !reduce && (
          <div className="absolute inset-x-0 top-0 z-30 h-[3px]" aria-hidden="true">
            <div
              className="h-full bg-moss/70 transition-[width] duration-200 ease-out"
              style={{ width: loadPct + '%' }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
