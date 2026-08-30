# Made for Your Brand, a scroll cinematic rescue site

A single page scroll site where the scroll position scrubs a 49.6 second film of a
rescue story, plus five coming soon routes that share the same header and footer.

Vite, React, Tailwind, GSAP ScrollTrigger, Lenis, Framer Motion, Lucide.

```bash
npm install
npm run dev
```

---

## Where to put your files

### 1. Raw videos, `raw/`

The seven clips are already renamed and in place. To swap any of them, drop a
1920x1080 mp4 into `raw/` using these exact names, in this scroll order:

| File | Scene |
|---|---|
| `raw/01-found.mp4` | the dog alone in the rain |
| `raw/02-rescue.mp4` | the rescue |
| `raw/03-trust.mp4` | sniffing his hand |
| `raw/04-care.mp4` | the bandage |
| `raw/05-nourish.mp4` | eating from the bowl |
| `raw/06-bond.mp4` | being petted |
| `raw/07-home.mp4` | the shared moment |

### 2. Run the video step

```bash
bash scripts/grade.sh
```

That one command does everything: crops the watermark out, grades, joins the
seven clips with soft crossfades, and writes the web files into `public/hero/`.
It takes about eight minutes. ffmpeg must be on your PATH.

If you change a clip's length, update its `seconds` value in
`src/data/site.js` so the captions stay locked to the picture. The script prints
the final master duration when it runs.

### 3. Review avatars, `public/avatars/`

Drop square images (400x400 or larger) named `priya.jpg`, `david.jpg`,
`sara.jpg`, `aman.jpg`. Point a review at a different file by editing its
`avatar` field in `src/data/site.js`. If a file is missing the card falls back
to the person's initials on a soft wash, which is a designed state, so you can
ship without avatars.

### 4. Logo, `public/brand/`

Replace `logo.svg` with your own square logo (svg, png or jpg) and
`favicon.svg` with your tab icon. Keep the filenames or update `brand.logo` in
`src/data/site.js`. The mark renders inside a 44px rounded square. If the file
is missing the lockup falls back to a paw mark.

---

## Where to edit the words

Everything a client would want to change lives in **`src/data/site.js`**:
brand name and tagline, email, phone, address, the badge number and label, all
seven story captions, the four reviews, the six services, and the nav links.
Nothing else needs touching for a content change.

---

## About the video step

**The watermark.** The Gemini mark sits at roughly x 1725 to 1920, y 860 to 1040
on a 1920x1080 frame, which is about 11 percent in from the right edge. A 6
percent crop leaves it visible. The script crops to `1664x936`, the largest
exact 16:9 box that clears it with room to spare, then scales back to full
frame. Verified clean on all seven clips. The frosted badge sits over that
corner as a second line of defence.

**The joins.** The seven clips are joined with 0.4 second crossfades rather than
hard cuts, so scrubbing across a scene change reads as a dissolve.

**The encodes.**

| File | What it is | Size |
|---|---|---|
| `master.mp4` | 1280x720, 24fps, crf 26, **GOP 5** | ~18 MB |
| `master-mobile.mp4` | **native 9:16 centre cut**, 540x960, 24fps, GOP 5 | ~9 MB |
| `master.webm` | 960x540 VP9, fallback only | ~10 MB |
| `poster.jpg` / `poster-mobile.jpg` | first frame of each | 0.3 MB |

**These are tuned for seek cost, not for how a paused still looks.** Scrubbing
asks the decoder to jump to a new time on every scroll frame, and one seek costs
roughly *pixels per frame x frames back to the nearest keyframe*. 1280x720 at
GOP 5 is about three times cheaper per seek than 1600x900 at GOP 10 and comes
out the same file size, which is the whole trade. The sources are 24fps, so
encoding at 30 was duplicating every fifth frame and making the browser decode
25 percent more frames for no extra picture.

The mobile file is a real portrait cut, not a shrunken widescreen one. A phone
held upright only ever shows the middle quarter of a 16:9 frame, so cropping at
encode time means every byte that ships is a byte you can actually see. The
centre cut also sits far away from the old watermark corner.

To trade quality for weight, change `-crf 27` in `scripts/grade.sh`. Higher is
smaller.

---

## How the scroll engine works

- **The film streams; it is not downloaded up front.** One 1 byte range probe
  decides how to load it. A CDN answers `206`, so the browser gets the URL
  directly and can seek into the file within a few hundred milliseconds. A host
  that ignores `Range` pins `video.seekable` to `[0,0]` and clamps every seek to
  frame zero, so there the whole file is pulled into a Blob instead, which is
  always seekable. The first build always used the Blob, which meant that on a
  real connection there were many seconds where scrolling moved the captions
  over a frozen poster. That reads as a broken scrub, and it was the main reason
  the deployed site felt worse than local, where the file loads in 180ms.
- Seeks are clamped to what is actually buffered, so a fast scroll into
  un-downloaded film holds the picture for a beat instead of stalling the
  decoder on a network round trip.
- The seek threshold is one frame. Below that, a seek cannot change what is on
  screen, so it is a decode thrown away.
- The stage is pinned with **CSS sticky**, and GSAP ScrollTrigger drives the
  scrub. A transform pin recalculates on every resize, and a phone URL bar
  sliding away fires resize constantly, which is the usual cause of the page
  jumping mid scroll. Sticky simply reflows.
- Scroll position eases toward the decoder rather than snapping, and **no seek
  is ever queued while the decoder is still resolving the last one**, so a fast
  flick cannot pile up seeks and freeze the picture.
- On phones the seek step is coarser (fewer decodes), the portrait film and
  portrait poster are served, and each video is primed with a muted play then
  pause on first touch, because iOS Safari will not paint a seeked frame on a
  video that has never played.
- The scrub loop only runs while the film is on screen.
- Captions and the progress rail are written straight to the DOM inside the
  animation frame, so scrubbing causes no React re renders at all.
- `prefers-reduced-motion` skips Lenis and the video entirely, shortens the
  track, and leaves the poster with cross fading captions.

---

## Browser support

Targets **iOS 12 and up** (Safari 12, 2018), Android 6 and up, and every current
desktop browser. Tablets are treated as first class, not as wide phones.

Safari 12 predates a lot of what this page uses, so the support is real rather
than assumed:

| Missing in Safari 12 | How it is handled |
|---|---|
| Optional chaining, nullish coalescing, spread | `build.target` down-levels them, and `@vitejs/plugin-legacy` ships a second fully transpiled bundle with core-js polyfills behind `nomodule` |
| `clamp()` | Every step of the type scale declares a static `font-size` first and the fluid one second, so an old parser keeps the static size |
| `svh` / `dvh` | One `--vh-full` token, `100vh` by default, upgraded to `100svh` inside `@supports` |
| flex `gap` | Buttons, chips and card rows space with `margin-left` on adjacent siblings, upgraded to real `gap` inside `@supports (gap: 1px)` |
| `position: sticky` unprefixed | `.sticky-safe` declares `-webkit-sticky` first |
| `backdrop-filter` | `-webkit-` prefixed, and the frosted surfaces fall back to a more opaque solid background where neither exists |
| `IntersectionObserver` (12.0 and 12.1) | Polyfilled. Safari 12 takes the modern bundle, so the polyfill is imported in `main.jsx` rather than left to the legacy chunk. It no-ops when the API is native |
| `ResizeObserver` (Lenis needs it) | Lenis is skipped when it is absent. The page falls back to native scroll, the scrub still works, it just loses the inertia |
| `text-wrap: balance` / `pretty`, `size-adjust` | Progressive. They improve typography where supported and are ignored elsewhere |

Verified with no horizontal overflow and no element collisions at 320, 360, 375,
390, 430, 640, 768, 834, 1024, 1194, 1280, 1440 and 1920 wide, in both
orientations for the tablet sizes.

Two notes on how the layout adapts:

- **The film follows the screen shape, not the input device.** A portrait screen
  gets the native 9:16 cut; a tablet in landscape is a touch device but still
  gets the 16:9 one, because `object-cover` would otherwise crop a portrait file
  down to a sliver.
- **The hero furniture rearranges rather than shrinking.** On phones the scene
  rail becomes a hairline on the bottom edge of the stage with the scene name
  above it, because a row of dots fought the rescue badge for space at 320 wide.
  On tablets the scroll cue moves to the bottom left, since centred it sat
  against the badge at 768.

## Deploying

```bash
npm run build
```

`dist/` is a static site. `vercel.json` already carries everything Vercel needs,
so importing the repo and pressing Deploy is the whole job. Do not add comment
keys to that file: Vercel validates it strictly and rejects any property outside
its schema, including `comment`.

What is in `vercel.json`, and why:

- **`rewrites`: `/(.*)` to `/index.html`.** The coming soon pages are client
  routes, so the host has to serve `index.html` for unknown paths or a refresh
  on `/adopt` returns a 404. Vercel checks the filesystem before applying
  rewrites, so real files under `/hero`, `/assets` and `/brand` are still served
  normally and the catch-all is safe.
- **`/assets/*` cached immutable for a year.** Vite content-hashes those
  filenames, so a new build is a new URL.
- **`/hero/*` cached for an hour, then stale-while-revalidate.** The film keeps
  the *same* filename across builds, so it must not be immutable. If it were,
  re-running `scripts/grade.sh` and redeploying would leave returning visitors
  on the old video until the cache expired.

For other hosts: `public/_redirects` covers Netlify; on Apache use
`FallbackResource /index.html`.

**Bandwidth.** Each desktop visitor downloads the 18 MB film, each phone
visitor 8 MB. On a Vercel Hobby plan the 100 GB monthly allowance works out to
roughly 5,500 desktop views. Raise `-crf 27` in `scripts/grade.sh` if you need
smaller files.
