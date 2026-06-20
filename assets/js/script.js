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
    const targets = $$('.card, .tile, .gallery-item, .section-title, .section-lead');
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
})();
