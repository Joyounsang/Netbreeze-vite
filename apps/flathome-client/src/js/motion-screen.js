'use strict';

function initMotionScreen() {
  document.querySelectorAll('.motion-screen').forEach((screen) => {
    if (screen.dataset.motionScreenInit === 'true') return;

    screen.dataset.motionScreenInit = 'true';

    function reveal() {
      screen.classList.add('is-visible');
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      reveal();
      return;
    }

    if (!('IntersectionObserver' in window)) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          reveal();
          observer.disconnect();
        });
      },
      {
        threshold: 0.35,
        rootMargin: '0px 0px -10% 0px',
      },
    );

    observer.observe(screen);
  });
}

$(document).ready(initMotionScreen);
