'use strict';

import { scrollTo } from '@/js/smooth-scroll.js';

function initScrollToTop() {
  document.querySelectorAll('.js-scroll-top').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scrollTo(0, { immediate: reduceMotion });
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollToTop);
} else {
  initScrollToTop();
}
