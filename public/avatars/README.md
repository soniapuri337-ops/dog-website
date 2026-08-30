# Review avatars

Drop square images here (400x400 or larger, jpg/png/webp) and point each review
at them in `src/data/site.js`:

    avatar: '/avatars/priya.jpg'

Expected filenames for the demo reviews:

    priya.jpg
    david.jpg
    sara.jpg
    aman.jpg

If a file is missing the card falls back to the person's initials on a soft
green, pink or cream wash. That fallback is designed, not broken, so you can
ship without avatars.
