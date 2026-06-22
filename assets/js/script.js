(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu
  const toggle = $('.nav-toggle');
  const links = $('#navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Contact form -> WhatsApp
  const form = $('#contactForm');
  if (form) {
    const errorEl = $('#formError');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = $('#nombre').value.trim();
      const evento = $('#evento').value;
      const mensaje = $('#mensaje').value.trim();

      if (nombre.length < 2) {
        if (errorEl) errorEl.hidden = false;
        $('#nombre').focus();
        return;
      }
      if (errorEl) errorEl.hidden = true;

      const partes = [
        `Hola Miranda, soy ${nombre}.`,
        `Me interesa servicio para ${evento}.`,
        mensaje
      ].filter(Boolean);
      const texto = partes.join(' ');
      const url = `https://wa.me/19145253189?text=${encodeURIComponent(texto)}`;
      window.open(url, '_blank', 'noopener');
    });
  }

  // Reveal on scroll
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const targets = $$('.card, .tile, .pack, .section-title, .section-lead');
    targets.forEach(el => el.classList.add('reveal'));
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(el => observer.observe(el));
  }

  // Carrusel galería
  const carousel = $('#carousel');
  const track = $('#carouselTrack');
  const dotsWrap = $('#carouselDots');
  if (carousel && track && dotsWrap) {
    const slides = $$('.slide', track);
    const prev = $('.carousel-arrow--prev', carousel);
    const next = $('.carousel-arrow--next', carousel);

    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
      b.setAttribute('aria-label', `Ir a slide ${i + 1}`);
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
    });
    const dots = $$('.carousel-dot', dotsWrap);

    const goTo = (i) => {
      const slide = slides[i];
      if (!slide) return;
      const left = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
      track.scrollTo({ left, behavior: prefersReduced ? 'auto' : 'smooth' });
    };

    const step = (dir) => {
      const active = currentIndex();
      goTo(Math.max(0, Math.min(slides.length - 1, active + dir)));
    };

    const currentIndex = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      slides.forEach((s, i) => {
        const sc = s.offsetLeft + s.clientWidth / 2;
        const d = Math.abs(sc - center);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    };

    prev && prev.addEventListener('click', () => step(-1));
    next && next.addEventListener('click', () => step(1));

    let raf;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = currentIndex();
        dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
      });
    }, { passive: true });

    // Autoplay con pausa al interactuar
    let autoplay;
    let paused = false;
    const start = () => {
      if (prefersReduced) return;
      stop();
      autoplay = setInterval(() => {
        if (paused) return;
        const i = currentIndex();
        goTo(i >= slides.length - 1 ? 0 : i + 1);
      }, 4500);
    };
    const stop = () => { if (autoplay) clearInterval(autoplay); };
    ['pointerdown', 'touchstart', 'mouseenter'].forEach(ev =>
      carousel.addEventListener(ev, () => { paused = true; }, { passive: true })
    );
    carousel.addEventListener('mouseleave', () => { paused = false; });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => e.isIntersecting ? start() : stop());
      }, { threshold: 0.25 });
      io.observe(carousel);
    } else {
      start();
    }
  }
})();
