'use strict';

function initKeypointExaImg() {
  const keypoint = document.querySelector('.keypoint');
  if (!keypoint || keypoint.dataset.exaImgInit === 'true') return;

  keypoint.dataset.exaImgInit = 'true';

  const images = [...keypoint.querySelectorAll('.exa-img')];
  if (!images.length) return;

  function reveal() {
    keypoint.classList.add('is-exa-visible');
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
    { threshold: 0.2 },
  );

  observer.observe(keypoint);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initKeypointExaImg);
} else {
  initKeypointExaImg();
}
