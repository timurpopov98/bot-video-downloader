# Bot Video Downloader — Landing Page

Marketing landing page for the **Bot Video Downloader** Chrome extension.

- Content structure inspired by `maxvideodownloader.pro` (hero → supported sites →
  how it works → features → testimonials → FAQ → footer).
- Visual/motion language inspired by `unitedcarriers.com`: a cinematic,
  scroll-driven "single film" experience — pinned sections, scroll-scrubbed
  product demo, big bold display type, magnetic buttons, marquees, and
  section-to-section dark/light transitions.

Pure static site — no build step required.

## Structure

```
index.html        all markup / sections
css/style.css     design tokens + all styling
js/main.js        GSAP + ScrollTrigger + Lenis smooth scroll, cursor,
                   marquees, counters, pinned scroll "reel", FAQ accordion
```

External libraries are loaded from CDN (GSAP, ScrollTrigger, Lenis,
Font Awesome, Google Fonts) — no `npm install` needed.

## Run locally

Any static server works, e.g.:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy

Works as-is on GitHub Pages, Netlify, Vercel, or Cloudflare Pages — just
point them at the repo root (`index.html`).

## ⚠️ Placeholders to replace before launch

A few things could **not** be pulled in automatically (no live network
access to the reference sites in the session that built this), and a few
are intentionally generic so nothing false is published under your name:

- **Testimonials** (`#testimonials` in `index.html`) — currently generic
  placeholder quotes attributed to "Chrome user". Swap these for real
  reviews once the extension has some on the Chrome Web Store listing.
- **Install/rating stats** — the hero and stats sections intentionally use
  qualitative claims (100% free, 0 ads, etc.) rather than fabricated
  numbers. Once you have real installs/rating figures from the Chrome Web
  Store, consider adding a stat like "X,XXX+ users" or "4.x★ rating".
  There's a floating `.stats-num` counter component already built for that.
  This is only a placeholder that must be replaced with real numbers.
- **Feature list** (`#features`) — written from general knowledge of what
  video-downloader extensions typically support (formats, subtitles, audio
  extraction, batch downloads, etc.). Double-check every claim against what
  Bot Video Downloader actually does and adjust/remove anything that isn't
  accurate.
- **Support email** — `support@botvideodownloader.com` is a placeholder;
  update it (and the Privacy/Terms footer links, currently `#`) to the real
  addresses/pages.
- **Chrome Web Store link** — already wired to the real listing:
  `https://chromewebstore.google.com/detail/bot-video-downloader-%E2%80%94-hl/nibkammgffehkmeicmoacioimoddidpa`

## Customizing the look

Colors, fonts and radii are all CSS custom properties at the top of
`css/style.css` (`:root { ... }`) — change `--accent`, `--cta`, etc. to
retheme the whole site.
