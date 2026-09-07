/* Bot Video Downloader — landing page interactions
   GSAP + ScrollTrigger + Lenis smooth scroll */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- Lenis smooth scroll ---------------- */
  let lenis;
  if (window.Lenis && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------------- scroll progress bar ---------------- */
  const progressBar = document.getElementById('scrollProgress');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => { progressBar.style.width = (self.progress * 100) + '%'; }
  });

  /* ---------------- custom cursor ---------------- */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (dot && ring && window.matchMedia('(hover:hover)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    });
    document.querySelectorAll('[data-cursor-hover]').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
    // lighten cursor ring over light-background sections
    document.querySelectorAll('.stats-section,.how,.sites,.testimonials,.faq,.site-footer').forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec, start: 'top 60%', end: 'bottom 40%',
        onEnter: () => ring.classList.add('on-light'),
        onEnterBack: () => ring.classList.add('on-light'),
        onLeave: () => ring.classList.remove('on-light'),
        onLeaveBack: () => ring.classList.remove('on-light'),
      });
    });
  }

  /* ---------------- header hide-on-scroll + side CTA ---------------- */
  const header = document.getElementById('siteHeader');
  const sideCta = document.getElementById('sideCta');
  ScrollTrigger.create({
    start: 100, end: 'max',
    onUpdate: (self) => {
      header.style.top = self.direction === 1 ? '-90px' : '8px';
      if (self.progress > 0.02) sideCta.classList.add('visible');
      else sideCta.classList.remove('visible');
    }
  });

  /* ---------------- magnetic buttons ---------------- */
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power3.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
    });
  });

  /* ---------------- hero reveal ---------------- */
  const heroTl = gsap.timeline({ delay: 0.2 });
  heroTl
    .to('.hero-title .reveal-line span', { y: '0%', duration: 1, stagger: 0.12, ease: 'power4.out' })
    .to('.hero .reveal-up', { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, '-=0.5');

  /* ---------------- generic scroll reveals ---------------- */
  gsap.utils.toArray('.reveal-up').forEach((el) => {
    if (el.closest('.hero')) return; // hero handled above
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
  gsap.utils.toArray('.feature-card, .t-card, .step, .stat-row').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 30, duration: 0.7, ease: 'power3.out', delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });

  /* ---------------- hero particles (floating video-format glyphs) ---------------- */
  const canvas = document.getElementById('heroParticles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const glyphs = ['MP4', 'MP3', 'HLS', 'SRT', '4K', 'WEBM'];
    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    function init() {
      resize();
      particles = Array.from({ length: 22 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        size: 10 + Math.random() * 8,
        alpha: 0.06 + Math.random() * 0.14,
        label: glyphs[Math.floor(Math.random() * glyphs.length)]
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -40) p.x = w + 40; if (p.x > w + 40) p.x = -40;
        if (p.y < -40) p.y = h + 40; if (p.y > h + 40) p.y = -40;
        ctx.font = `700 ${p.size}px Inter, sans-serif`;
        ctx.fillStyle = `rgba(244,244,246,${p.alpha})`;
        ctx.fillText(p.label, p.x, p.y);
      });
      requestAnimationFrame(draw);
    }
    init();
    draw();
    window.addEventListener('resize', () => resize());
  }

  /* ---------------- stat counters ---------------- */
  document.querySelectorAll('.stat-num').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target, duration: 1.6, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; }
        });
      }
    });
  });

  /* ---------------- cinematic product reel (pinned scrub) ---------------- */
  const reelSection = document.getElementById('reel');
  if (reelSection) {
    const stages = gsap.utils.toArray('.reel-stage-layer');
    const lines = gsap.utils.toArray('.reel-line');
    const extIcon = document.getElementById('extIcon');
    const extBadge = document.getElementById('extBadge');
    const reelFill = document.getElementById('reelFill');
    const reelPct = document.getElementById('reelPct');
    const reelSpeed = document.getElementById('reelSpeed');

    function setStage(index) {
      stages.forEach((s, i) => s.classList.toggle('is-active', i === index));
      lines.forEach((l, i) => l.classList.toggle('is-active', i === index || (index >= 2 && i === 2)));
      extIcon.classList.toggle('is-active', index >= 1);
      extBadge.textContent = index >= 1 ? '3' : '0';
    }
    setStage(0);

    ScrollTrigger.create({
      trigger: reelSection,
      start: 'top top',
      end: '+=300%',
      pin: '.reel-pin',
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress; // 0..1
        reelSpeed.textContent = Math.round(p * 100) + '%';
        // 4 stages across the scroll range
        let stage = Math.min(3, Math.floor(p * 4));
        setStage(stage);
        if (stage === 2) {
          const local = gsap.utils.clamp(0, 1, (p * 4) - 2);
          reelFill.style.width = (local * 100) + '%';
          reelPct.textContent = Math.round(local * 100) + '%';
        } else if (stage > 2) {
          reelFill.style.width = '100%';
          reelPct.textContent = '100%';
        } else {
          reelFill.style.width = '0%';
          reelPct.textContent = '0%';
        }
      }
    });
  }

  /* ---------------- faq accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------------- feature card tilt ---------------- */
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, { rotateX: py * -8, rotateY: px * 8, duration: 0.4, ease: 'power2.out', transformPerspective: 600 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power2.out' });
    });
  });

  /* ---------------- mobile nav burger ---------------- */
  const burger = document.getElementById('navBurger');
  const nav = document.getElementById('mainNav');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = nav.style.display === 'flex';
      nav.style.display = open ? 'none' : 'flex';
      if (!open) {
        Object.assign(nav.style, {
          position: 'fixed', top: '76px', left: '16px', right: '16px',
          background: 'rgba(15,14,20,.96)', flexDirection: 'column', gap: '18px',
          padding: '24px', borderRadius: '18px', border: '1px solid rgba(255,255,255,.1)'
        });
      }
    });
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => { nav.style.display = 'none'; });
    });
  }

  /* refresh ScrollTrigger after everything is laid out */
  window.addEventListener('load', () => ScrollTrigger.refresh());
});
