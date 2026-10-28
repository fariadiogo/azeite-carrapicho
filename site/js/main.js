(function () {
  const { gsap, ScrollTrigger, Scenery } = window;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || !gsap || !ScrollTrigger;
  // phones, held either way up (a phone on its side is wide but only ~400px tall), and everything else
  const PHONE = '(max-width: 900px), (orientation: landscape) and (max-height: 500px)';
  const WIDE = '(min-width: 901px) and (orientation: portrait), (min-width: 901px) and (min-height: 501px)';

  /* ---------- draw the scenery ---------- */

  const dawn = Scenery.landscape('dawn', 11);
  // sky and branch get a wrapper <g> so CSS can drift / sway it while GSAP moves the <svg>
  const wrap = (key, svg) => (key === 'sky' || key === 'branch' ? `<g>${svg}</g>` : svg);
  $$('[data-layer]').forEach((svg) => { svg.innerHTML = wrap(svg.dataset.layer, dawn[svg.dataset.layer]); });
  const dusk = Scenery.landscape('dusk', 23);
  $$('[data-dusk]').forEach((svg) => { svg.innerHTML = wrap(svg.dataset.dusk, dusk[svg.dataset.dusk]); });

  // the title, letter by letter, for the opening reveal
  const h1 = $('.hero__title h1');
  h1.innerHTML = [...h1.textContent].map((ch) => `<span class="ch" aria-hidden="true">${ch}</span>`).join('');

  const wall = Scenery.buildWall(31, 1600, 560);
  $('.stones__wall').innerHTML = wall.svg;

  const print = Scenery.fingerprint(3).map((d) => `<path d="${d}"/>`).join('');
  $$('svg.fp').forEach((svg) => { svg.innerHTML = print; });

  // the stones quote, word by word, so it can light up as the wall builds
  $$('[data-split]').forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  });

  /* ---------- documentary ---------- */

  const modal = $('#doc-modal');
  const frame = $('.modal__frame');
  let lenis;
  const closeModal = () => { frame.innerHTML = ''; modal.hidden = true; lenis && lenis.start(); };
  $('.doc').addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.yt;
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="Rostos da Aldeia — Serra de Santo António" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    modal.hidden = false;
    lenis && lenis.stop();
  });
  $('.modal__close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  /* ---------- um ano no olival, on phones: a row you swipe ---------- */

  // each month tints the section; on wide screens the scroll does it, on phones the swipe
  const yearTint = { spring: '#e6ebd6', bloom: '#eef0de', summer: '#f3e7c8', harvest: '#dfe8dc', mill: '#ecdcc2', winter: '#e3e9de' };
  const yearRow = $('.year__seasons');
  const phone = matchMedia('(max-width: 899px)');
  const followRow = () => {
    if (!phone.matches) return;
    const cards = $$('.season', yearRow);
    const seen = yearRow.scrollLeft / Math.max(1, yearRow.scrollWidth - yearRow.clientWidth);
    const i = Math.round(seen * (cards.length - 1));
    // the bar fills a sixth per month, and is full at the end of the row
    $('.year__bar span').style.transform = `scaleX(${(1 + seen * (cards.length - 1)) / cards.length})`;
    $('.year').style.backgroundColor = yearTint[cards[i].dataset.season];
  };
  yearRow.addEventListener('scroll', followRow, { passive: true });
  phone.addEventListener('change', followRow);
  followRow();

  if (reduce) {
    document.documentElement.classList.add('no-motion');
    return;
  }

  /* ---------- smooth scroll ---------- */

  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.8 });
    else if (target === 0) scrollTo({ top: 0, behavior: 'smooth' });
    else target.scrollIntoView({ behavior: 'smooth' });
  }));

  gsap.to('.progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* ---------- hero: the serra at dawn ---------- */

  // force3D only for the intro: afterwards the letters go back to being plain text, not a GPU layer each
  gsap.from('.hero__title h1 .ch', { yPercent: 105, rotation: 4, duration: 1.5, stagger: 0.045, ease: 'power4.out', delay: 0.2, force3D: true, clearProps: 'transform' });
  gsap.from('.hero__title .eyebrow, .hero__sub', { y: 24, opacity: 0, duration: 1.4, stagger: 0.5, ease: 'power3.out', delay: 0.5 });
  gsap.from('.hero [data-layer]', { y: (i) => 20 + i * 22, duration: 2.4, ease: 'power3.out', stagger: 0.05 });
  gsap.from('.layer--branch', { xPercent: 30, yPercent: -30, rotation: 8, duration: 2.6, ease: 'power3.out', delay: 0.3 });

  // The sun rises from behind the serra over the first half, flares, and the
  // real serra opens out of it: a circle of light onto the aerial photo, which
  // is the same image, at the same scale, that the next section starts on.
  const hero = $('#hero');
  gsap.timeline({
    scrollTrigger: {
      trigger: hero, start: 'top top', end: '+=170%', scrub: true, pin: true, invalidateOnRefresh: true,
      // At the end the hero shows exactly what the territory's sticky photo shows,
      // so hide it rather than let it scroll away over a copy of itself.
      onLeave: () => gsap.set(hero, { autoAlpha: 0 }),
      onEnterBack: () => gsap.set(hero, { autoAlpha: 1 }),
    },
  })
    .to('.hero__sky', { yPercent: 8, ease: 'none', duration: 1 }, 0)
    .to('[data-layer=sky]', { yPercent: -3, ease: 'none', duration: 1 }, 0)
    .fromTo('.hero__sun', { y: () => innerHeight * 0.34 }, { y: 0, ease: 'sine.out', duration: 0.5 }, 0)
    .fromTo('.hero__sun', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.3 }, 0)
    .to('.hero__sun', { scale: 1.7, ease: 'power1.in', duration: 0.13 }, 0.42)
    // keeps growing a little behind the opening photo, so its glow rings the edge
    .to('.hero__sun', { scale: 2.6, ease: 'power1.in', duration: 0.45 }, 0.55)
    .to('[data-layer=far]', { yPercent: -4, ease: 'none', duration: 1 }, 0)
    .to('[data-layer=mid]', { yPercent: -10, ease: 'none', duration: 1 }, 0)
    .to('[data-layer=plateau]', { yPercent: -18, ease: 'none', duration: 1 }, 0)
    .to('.hero__title', { yPercent: 32, ease: 'none', duration: 1 }, 0)
    .to('.hero__title', { opacity: 0, duration: 0.2, ease: 'none' }, 0.42)
    .to('[data-layer=near]', { yPercent: -20, ease: 'none', duration: 1 }, 0)
    .to('.layer--branch', { yPercent: -70, rotation: -6, ease: 'none', duration: 0.8 }, 0)
    .to('.hero__cue', { opacity: 0, duration: 0.1 }, 0)
    // the photo isn't drawn at all until it starts to open
    .fromTo('.hero__photo', { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', duration: 0.05 }, 0.55)
    .fromTo('.hero__photo', { '--r': '0%' }, { '--r': '135%', ease: 'power1.in', duration: 0.45 }, 0.55)
    .fromTo('.hero__photo img', { scale: 1.45, filter: 'brightness(2.4) contrast(.55) saturate(.4)' }, { scale: 1.18, filter: 'brightness(1) contrast(1) saturate(1)', ease: 'power1.out', duration: 0.45 }, 0.55);

  /* ---------- território ---------- */

  gsap.fromTo('.territory__img', { scale: 1.18 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.territory', start: 'top top', end: 'bottom bottom', scrub: true },
  });

  /* ---------- generic parallax, reveals, clip reveals ---------- */

  const drift = (el) => {
    const s = parseFloat(el.dataset.speed);
    gsap.fromTo(el, { y: () => innerHeight * s * 0.5 }, {
      y: () => -innerHeight * s * 0.5, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  };
  $$('[data-speed]:not(.member)').forEach(drift);
  // on phones the family is one person per row, and drifting rows would run into each other
  gsap.matchMedia().add('(min-width: 561px)', () => $$('.member[data-speed]').forEach(drift));

  $$('.plx img').forEach((img) => gsap.fromTo(img, { yPercent: -7 }, {
    yPercent: 7, ease: 'none',
    scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
  }));

  $$('.reveal').forEach((el) => gsap.from(el, {
    y: 60, opacity: 0, duration: 1.3, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
  }));

  $$('[data-clip]').forEach((el) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 15%', scrub: true } });
    tl.fromTo(el, { clipPath: 'inset(16% 12% 16% 12% round 8px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0)
      .fromTo(el.querySelector('img'), { scale: 1.3 }, { scale: 1, ease: 'none' }, 0);
  });

  /* ---------- pedra sobre pedra: the wall builds itself ---------- */

  const quote = $('.stones__quote');
  const lightQuote = (progress) => {
    const words = $$('.w', quote);
    const lit = Math.ceil(progress * 1.35 * words.length);
    words.forEach((w, i) => w.classList.toggle('is-on', i < lit));
  };
  const rnd = (seed) => { const x = Math.sin(seed * 999) * 10000; return x - Math.floor(x); };
  // phones only show the bottom four courses (the CSS hides the rest), so the wall is built from those
  gsap.matchMedia().add({ phone: PHONE, wide: WIDE }, ({ conditions }) => {
    const build = gsap.timeline({
      scrollTrigger: {
        trigger: '.stones__viewport', start: 'top top', end: '+=170%', scrub: 0.8, pin: true,
        onUpdate: (self) => lightQuote(self.progress),
      },
    });
    $$('.stones__wall .stone').forEach((s, i) => {
      const row = +s.dataset.row;
      if (conditions.phone && row >= 4) return;
      build.from(s, {
        y: -(70 + rnd(i) * 130), rotation: (rnd(i + 7) - 0.5) * 30, scale: 0.92, opacity: 0,
        transformOrigin: '50% 50%', duration: 0.5, ease: 'power2.out',
      }, row * 0.32 + rnd(i + 3) * 0.3);
    });
  });

  /* ---------- legado ---------- */

  // the year sits on the right, behind the text, and only drifts a little so it never slides behind the photo
  gsap.fromTo('.legacy__year', { xPercent: 0 }, {
    xPercent: -5, ease: 'none',
    scrollTrigger: { trigger: '.legacy', start: 'top bottom', end: 'top top', scrub: true },
  });
  [['.ledger__page--a', -5, 2], ['.ledger__page--b', 4, -3], ['.ledger__page--c', -2, 5]].forEach(([sel, from, to]) => {
    gsap.fromTo(sel, { rotation: from }, {
      rotation: to, ease: 'none',
      scrollTrigger: { trigger: '.ledger', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  gsap.from('.ledger__note', {
    opacity: 0, y: 30, rotation: -3, stagger: 0.3, duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: '.ledger', start: 'center 75%' },
  });

  /* ---------- um ano no olival, on wide screens: the scroll drives it sideways ---------- */

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const section = $('.year');
    const track = $('.year__track');
    const dist = () => track.scrollWidth - innerWidth;
    const ride = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: section, start: 'top top', end: () => '+=' + dist(), scrub: 0.8, pin: true, invalidateOnRefresh: true,
        onUpdate: (self) => gsap.set('.year__bar span', { scaleX: self.progress }),
      },
    });
    $$('.season').forEach((s) => {
      gsap.fromTo($('img', s), { xPercent: -15 }, {
        xPercent: 0, ease: 'none',
        scrollTrigger: { trigger: s, containerAnimation: ride, start: 'left right', end: 'right left', scrub: true },
      });
      ScrollTrigger.create({
        trigger: s, containerAnimation: ride, start: 'left 60%', end: 'right 60%',
        onToggle: (self) => self.isActive && gsap.to(section, { backgroundColor: yearTint[s.dataset.season], duration: 0.9 }),
      });
    });
  });

  /* ---------- os azeites ---------- */

  $$('[data-rise]').forEach((el) => gsap.fromTo($('img', el), { yPercent: 22 }, {
    yPercent: 0, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'center 55%', scrub: true },
  }));

  /* ---------- closing: the serra at dusk ---------- */

  gsap.timeline({ scrollTrigger: { trigger: '.dusk', start: 'top bottom', end: 'bottom bottom', scrub: true } })
    .fromTo('[data-dusk=sky]', { yPercent: 4 }, { yPercent: 0, ease: 'none' }, 0)
    .fromTo('[data-dusk=far]', { yPercent: 8 }, { yPercent: 0, ease: 'none' }, 0)
    .fromTo('[data-dusk=mid]', { yPercent: 16 }, { yPercent: 0, ease: 'none' }, 0)
    .fromTo('[data-dusk=plateau]', { yPercent: 26 }, { yPercent: 0, ease: 'none' }, 0)
    .fromTo('[data-dusk=near]', { yPercent: 40 }, { yPercent: 0, ease: 'none' }, 0)
    .fromTo('.dusk__sun', { yPercent: -90 }, { yPercent: 20, ease: 'none' }, 0)
    .fromTo('.dusk__quote p', { opacity: 0, y: 70 }, { opacity: 1, y: 0, stagger: 0.18, duration: 0.45, ease: 'none' }, 0.28);

  const fpPaths = $$('.fp--big path');
  fpPaths.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  gsap.to(fpPaths, {
    strokeDashoffset: 0, duration: 1.4, stagger: 0.04, ease: 'power2.out',
    scrollTrigger: { trigger: '.foot', start: 'top 90%' },
  });

  /* ---------- nav: solid once past the hero, current section underlined ---------- */

  const nav = $('#nav');
  ScrollTrigger.create({
    trigger: '#territorio', start: 'top 70px',
    onEnter: () => nav.classList.add('is-solid'), onLeaveBack: () => nav.classList.remove('is-solid'),
  });
  $$('.nav__links a').forEach((link) => {
    ScrollTrigger.create({
      trigger: link.getAttribute('href'), start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });

  // Triggers further down the page must be measured after the pins above them.
  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  /* fonts and lazy images change heights; re-measure once they settle */
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
