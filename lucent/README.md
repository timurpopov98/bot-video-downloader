# Lucent Tattoo Studio — website

Static site, no build step. Open `lucent/index.html` through any static server:

```bash
cd lucent && python3 -m http.server 8080
```

## Structure

```
index.html            home page (hero video, manifesto, artists, piercing, events, journal, visit)
css/style.css         design tokens at the top (:root) and all styles
js/i18n.js            all copy in English and Bulgarian (keys match data-i18n attributes)
js/main.js            torn-paper edges, language switch, GSAP/ScrollTrigger/Lenis motion
assets/video/hero.mp4 hero banner video (replace with the final film, keep the name)
assets/img/paper.jpg  generated crumpled-paper texture
vendor/               GSAP, ScrollTrigger, Lenis
preview.html          copy of index.html without the document wrapper, used for the Claude artifact preview
```

## Still needed

- Artist photos: put them in `assets/img/artists/` as `hanna.jpg`, `boris.jpg`,
  `nikolay.jpg`, `daria.jpg`, `sasha.jpg`, `viga.jpg`. Until a file exists the
  card shows "photo coming".
- Logo file (SVG preferred) for the header.
- Opening hours (`visit.tbd` in `js/i18n.js`).
- Events: dates and real events (currently "date soon" placeholders).
- Journal posts: titles are drafts, the links do not lead anywhere yet.
