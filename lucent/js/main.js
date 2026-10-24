(() => {
  const I18N = window.LUCENT_I18N;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined";

  /* ---------- torn paper edges ---------- */
  // Seeded random so every scrap keeps the same tear between reloads.
  function rand(seed) {
    let s = seed % 2147483647 || 1;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }

  function tearEdge(points, from, to, steps, jitter, r, axis) {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = from[0] + (to[0] - from[0]) * t;
      const y = from[1] + (to[1] - from[1]) * t;
      const j = (r() - 0.5) * jitter;
      points.push(axis === "x" ? [x + j, y] : [x, y + j]);
    }
  }

  function tear(el, i) {
    const r = rand(97 * (i + 3));
    const big = el.dataset.torn === "hero";
    const w = el.offsetWidth || 300, h = el.offsetHeight || 300;
    const jx = (big ? 10 : 5) / w * 100;   // jitter in % of each side, ~5px
    const jy = (big ? 14 : 5) / h * 100;
    const p = [];
    tearEdge(p, [jx / 2, jy / 2], [100 - jx / 2, jy / 2], Math.round(w / 14), jy, r, "y");
    tearEdge(p, [100 - jx / 2, jy / 2], [100 - jx / 2, 100 - jy / 2], Math.round(h / 14), jx, r, "x");
    tearEdge(p, [100 - jx / 2, 100 - jy / 2], [jx / 2, 100 - jy / 2], Math.round(w / (big ? 9 : 14)), jy * (big ? 1.6 : 1), r, "y");
    tearEdge(p, [jx / 2, 100 - jy / 2], [jx / 2, jy / 2], Math.round(h / 14), jx, r, "x");
    el.style.clipPath = `polygon(${p.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(",")})`;
  }

  const tornEls = [...document.querySelectorAll("[data-torn]")];
  const tearAll = () => tornEls.forEach(tear);
  tearAll();
  let tearTimer;
  window.addEventListener("resize", () => { clearTimeout(tearTimer); tearTimer = setTimeout(tearAll, 200); });

  /* ---------- headings split into words ---------- */
  function split(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="split-line"><span>${w}</span></span>`).join(" ");
    return el.querySelectorAll(".split-line > span");
  }

  /* ---------- language ---------- */
  const STORE_KEY = "lucent-lang";
  function readLang() {
    try { const v = localStorage.getItem(STORE_KEY); if (v && I18N[v]) return v; } catch (e) {}
    return (navigator.language || "").toLowerCase().startsWith("bg") ? "bg" : "en";
  }
  function setLang(lang) {
    const dict = I18N[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const v = dict[el.dataset.i18n];
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-split]").forEach(split);
    document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    syncPauseLabel();
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
    if (hasGsap && window.ScrollTrigger) ScrollTrigger.refresh();
  }
  let currentLang = readLang();
  document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.lang === currentLang) return;
    currentLang = b.dataset.lang;
    if (hasGsap && !reduced) {
      // a quick paper flutter on the swapped copy
      gsap.fromTo("main [data-i18n], main [data-split]", { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .5, stagger: .004, ease: "power2.out" });
    }
    setLang(currentLang);
  }));

  /* ---------- hero video pause ---------- */
  const video = document.querySelector(".hero__video");
  const pauseBtn = document.querySelector("[data-pause]");
  function syncPauseLabel() {
    if (!pauseBtn || !video) return;
    const span = pauseBtn.querySelector("span");
    const key = video.paused ? "hero.play" : "hero.pause";
    span.dataset.i18n = key;
    span.innerHTML = I18N[currentLang][key];
    pauseBtn.setAttribute("aria-pressed", String(video.paused));
  }
  if (pauseBtn && video) {
    pauseBtn.addEventListener("click", () => { video.paused ? video.play() : video.pause(); });
    video.addEventListener("play", syncPauseLabel);
    video.addEventListener("pause", syncPauseLabel);
    if (reduced) video.pause();
  }

  setLang(currentLang);

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- nav state ---------- */
  const nav = document.querySelector("[data-nav]");
  let lastY = 0;
  function onScroll(y) {
    nav.classList.toggle("is-scrolled", y > 40);
    nav.classList.toggle("is-hidden", y > lastY && y > 400);
    lastY = y;
  }
  window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });

  if (!hasGsap || reduced) return;

  /* ---------- motion ---------- */
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: a.getAttribute("href") === "#top" ? 0 : -40 });
    }));
  }

  const rotOf = el => parseFloat(getComputedStyle(el).getPropertyValue("--r")) || 0;

  // 1. Page-load: the film is laid onto the paper, then the name is set in ink.
  const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
  intro
    .from(".hero__frame", { opacity: 0, scale: 1.08, rotation: 4, y: -30, duration: 1.4 })
    .from(".hero__frame .tape", { opacity: 0, scale: 1.4, duration: .5, stagger: .12, ease: "back.out(2)" }, "-=0.7")
    .from(".hero__letters span", { yPercent: 110, duration: 1.2, stagger: .06 }, "-=1.0")
    .from(".hero__sub, .hero__pause", { opacity: 0, y: 14, duration: .8 }, "-=0.7")
    .from(".hero__note", { opacity: 0, x: -10, rotation: -10, duration: .8 }, "-=0.6")
    .from(".nav", { opacity: 0, y: -12, duration: .9, clearProps: "transform,opacity" }, "-=1.1");

  // Hero leaves: film sinks back, letters drift apart.
  gsap.to(".hero__frame", { yPercent: 8, scale: .96, rotation: -2.5, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__letters span", { yPercent: i => -20 - i * 12, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "20% top", end: "bottom top", scrub: true } });

  // 2. Headings rise word by word.
  document.querySelectorAll("[data-split]").forEach(el => {
    gsap.from(el.querySelectorAll(".split-line > span"), {
      yPercent: 105, duration: 1.1, ease: "expo.out", stagger: .07,
      scrollTrigger: { trigger: el, start: "top 85%" }
    });
  });

  // 3. Body copy fades up.
  gsap.utils.toArray("[data-reveal]").forEach(el => {
    gsap.from(el, { opacity: 0, y: 28, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  // 4. Paper scraps are dropped onto the table and pressed flat.
  gsap.utils.toArray("[data-place]").forEach((el, i) => {
    const r = rotOf(el);
    const parallax = el.hasAttribute("data-speed");
    gsap.set(el, { rotation: r });
    gsap.from(el, {
      opacity: 0, scale: 1.12, y: -50, rotation: r + (i % 2 ? 9 : -9),
      duration: 1.1, ease: "back.out(1.4)",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onComplete: () => { if (!parallax) gsap.set(el, { clearProps: "transform" }); }
    });
    if (parallax) {
      gsap.to(el, { yPercent: parseFloat(el.dataset.speed) * 100, ease: "none",
        scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: true } });
    }
  });

  // 5. Ink lines draw themselves as you scroll.
  gsap.utils.toArray("[data-draw]").forEach(path => {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, { strokeDashoffset: 0, ease: "none",
      scrollTrigger: { trigger: path.closest("section, .collage"), start: "top 75%", end: "center 40%", scrub: 1 } });
  });

  // 6. Tape marquee, nudged by scroll speed.
  const track = document.querySelector("[data-marquee]");
  if (track) {
    const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
    if (lenis) lenis.on("scroll", ({ velocity }) => {
      gsap.to(loop, { timeScale: 1 + Math.min(Math.abs(velocity) / 6, 4), duration: .3, overwrite: true });
      gsap.to(loop, { timeScale: 1, duration: 1.2, delay: .3, overwrite: false });
    });
  }

  // 7. Artists: on wide screens the board slides sideways while the section is pinned.
  const mm = gsap.matchMedia();
  mm.add("(min-width: 961px)", () => {
    const board = document.querySelector("[data-board]");
    const cards = gsap.utils.toArray("[data-card]");
    const distance = () => Math.max(0, board.scrollWidth - window.innerWidth);
    const slide = gsap.to(board, { x: () => -distance(), ease: "none",
      scrollTrigger: { trigger: ".artists__pin", start: "top top", end: () => "+=" + distance(), pin: true, scrub: 1, invalidateOnRefresh: true } });
    cards.forEach((card, i) => {
      gsap.from(card, { opacity: 0, y: -60, rotation: rotOf(card) + (i % 2 ? 10 : -10), scale: 1.1, duration: 1, ease: "back.out(1.5)",
        scrollTrigger: { trigger: card, containerAnimation: slide, start: "left 95%" },
        onComplete: () => gsap.set(card, { clearProps: "transform,opacity" }) });
    });
  });
  mm.add("(max-width: 960px)", () => {
    gsap.utils.toArray("[data-card]").forEach(card => {
      gsap.from(card, { opacity: 0, y: 40, duration: .9, ease: "power3.out",
        scrollTrigger: { trigger: ".board", start: "top 85%" }, onComplete: () => gsap.set(card, { clearProps: "transform,opacity" }) });
    });
  });

  // 8. The stamp presses down.
  gsap.from(".stamp", { scale: 1.6, opacity: 0, rotation: -40, duration: .7, ease: "back.out(2.2)",
    scrollTrigger: { trigger: ".visit", start: "top 60%" }, onComplete: () => gsap.set(".stamp", { clearProps: "transform" }) });

  window.addEventListener("load", () => { tearAll(); ScrollTrigger.refresh(); });
})();
