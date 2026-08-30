/* ---------------------------------------------------------------------------
   All editable content lives here. Change a name, a number or a phone number
   in this one file and it updates everywhere on the site.
   --------------------------------------------------------------------------- */

export const brand = {
  name: 'Made for Your Brand',
  tagline: 'Rescue, care and forever homes',
  logo: '/brand/logo.svg', // drop your logo here, square or wide both work
};

export const contact = {
  email: 'hello@yourbrand.com',
  phone: '+1 555 010 2025',
  phoneHref: 'tel:+15550102025',
  address: 'Studio 12, Willow Lane, Springfield',
  hours: 'Open every day, 8am to 7pm',
};

/* The rescue badge that sits over the film. Edit the number and the label. */
export const rescueBadge = {
  count: 500,
  suffix: '+',
  label: 'Rescues and Counting',
};

/* ---------------------------------------------------------------------------
   THE SCROLL STORY
   `seconds` is the graded length of each clip before the crossfade joins.
   Keep these in sync with scripts/grade.sh if you re-cut the film.
   --------------------------------------------------------------------------- */
export const XFADE = 0.4;

export const story = [
  {
    id: 'found',
    label: 'Found',
    seconds: 6,
    eyebrow: 'Every rescue begins somewhere',
    line: 'On a cold and rainy night, a frightened little life waited for someone to care.',
  },
  {
    id: 'rescue',
    label: 'Rescue',
    seconds: 8,
    eyebrow: 'Rescue',
    line: 'We reach them where they are, and we bring them to safety.',
  },
  {
    id: 'trust',
    label: 'Trust',
    seconds: 8,
    eyebrow: 'Trust',
    line: 'Healing starts the moment they know they are finally safe.',
  },
  {
    id: 'care',
    label: 'Care',
    seconds: 8,
    eyebrow: 'Medical Care',
    line: 'Gentle hands, expert veterinary treatment, and all the time they need.',
  },
  {
    id: 'nourish',
    label: 'Nourish',
    seconds: 8,
    eyebrow: 'Nourish',
    line: 'Warm meals, clean water, and steady strength returning day by day.',
  },
  {
    id: 'bond',
    label: 'Comfort',
    seconds: 6,
    eyebrow: 'Comfort',
    line: 'A little love goes a long way, and trust grows into a bond.',
  },
  {
    id: 'home',
    label: 'Home',
    seconds: 8,
    eyebrow: 'Forever Home',
    line: 'Every rescue deserves a happy ending. This is ours.',
    cta: { label: 'Meet our services', href: '#services' },
  },
];

/* Turn the clip lengths into normalised windows on the master film, accounting
   for the crossfade overlap at every join. A scene owns the film from the frame
   it becomes fully visible to the frame its dissolve begins. */
export function buildScenes(clips = story, xfade = XFADE) {
  const last = clips.length - 1;
  let offset = 0; // where this clip begins on the master timeline
  const spans = clips.map((clip, i) => {
    const start = i === 0 ? 0 : offset + xfade; // fully visible once the dissolve in ends
    const next = offset + clip.seconds - (i === last ? 0 : xfade);
    const end = next; // the dissolve out begins here (or the film ends)
    offset = next;
    return { ...clip, start, end };
  });
  const total = spans[last].end;
  return {
    total,
    scenes: spans.map((s) => ({ ...s, from: s.start / total, to: s.end / total })),
  };
}

/* ---------------------------------------------------------------------------
   REVIEWS
   Drop avatar images in /public/avatars and point `avatar` at them.
   Leave `avatar` empty and the card falls back to initials on a soft wash.
   --------------------------------------------------------------------------- */
export const reviews = [
  {
    name: 'Priya M.',
    role: 'Adopted Bella, 2024',
    stars: 5,
    avatar: '/avatars/priya.jpg',
    quote:
      'They saved my dog when no one else would. Kind, professional and genuinely loving people.',
    // The featured card highlights this phrase. It must appear inside `quote`.
    highlight: 'when no one else would',
    featured: true,
  },
  {
    name: 'David R.',
    role: 'Adopted Scout',
    stars: 5,
    avatar: '/avatars/david.jpg',
    quote:
      'From rescue to recovery, the care was incredible. My rescue pup is thriving today.',
  },
  {
    name: 'Sara L.',
    role: 'Weekend volunteer',
    stars: 5,
    avatar: '/avatars/sara.jpg',
    quote:
      'The shelter is spotless and the team treats every animal like family.',
  },
  {
    name: 'Aman K.',
    role: 'Foster carer',
    stars: 5,
    avatar: '/avatars/aman.jpg',
    quote:
      'Their vet team caught an illness early and treated it with so much patience. Forever grateful.',
  },
];

/* The record panel that sits under the featured review. Edit freely. */
export const impact = [
  { value: '500', suffix: '+', label: 'Animals rescued since we opened' },
  { value: '260', suffix: '', label: 'Families matched with a rescue' },
  { value: '12', suffix: '', label: 'Vets and volunteers on the team' },
];

export const reviewSummary = {
  score: '4.9',
  outOf: '5',
  count: '260',
  label: 'families rated their experience',
};

/* ---------------------------------------------------------------------------
   SERVICES  (icon names map to lucide-react in Services.jsx)
   --------------------------------------------------------------------------- */
export const services = [
  {
    icon: 'LifeBuoy',
    title: 'Animal Rescue',
    body: 'We respond to animals in distress and bring them to safety with care and urgency.',
  },
  {
    icon: 'Stethoscope',
    title: 'Veterinary Care',
    body: 'Full medical checkups, treatment and surgery led by an experienced veterinary team.',
  },
  {
    icon: 'Home',
    title: 'Shelter and Boarding',
    body: 'A clean, calm and comfortable space where every animal feels at home.',
  },
  {
    icon: 'Syringe',
    title: 'Vaccination and Wellness',
    body: 'Preventive care, vaccinations and routine wellness to keep pets healthy.',
  },
  {
    icon: 'Heart',
    title: 'Adoption Services',
    body: 'Thoughtful matching that helps every rescue find a loving forever family.',
  },
  {
    icon: 'Sparkles',
    title: 'Grooming and Daycare',
    body: 'Gentle grooming and joyful daycare for happy, healthy and social pets.',
  },
];

/* A short promise band that carries you out of the film and into the page. */
export const promises = [
  {
    icon: 'Clock',
    title: 'On call every day',
    body: 'A rescue line that answers, weekends and holidays included.',
  },
  {
    icon: 'HeartHandshake',
    title: 'Care that finishes',
    body: 'We stay with every animal from the first night to the last vet visit.',
  },
  {
    icon: 'Users',
    title: 'Matched with care',
    body: 'Homes chosen slowly, so an adoption only happens once.',
  },
];

export const navLinks = [
  { label: 'Story', href: '/#story' },
  { label: 'Reviews', href: '/#reviews' },
  { label: 'Services', href: '/#services' },
  { label: 'Contact', href: '/#contact' },
];

export const footerLinks = [
  { label: 'About us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Adopt a rescue', href: '/adopt' },
  { label: 'Donate', href: '/donate' },
  { label: 'Contact', href: '/contact' },
];
