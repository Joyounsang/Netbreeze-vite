'use strict';

function initScrollToTop() {
  document.querySelectorAll('.js-scroll-top').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollToTop);
} else {
  initScrollToTop();
}
