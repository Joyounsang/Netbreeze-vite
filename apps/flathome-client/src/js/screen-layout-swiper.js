'use strict';

import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const MOBILE_MQ = window.matchMedia('(max-width: 720px)');

/** @type {WeakMap<HTMLElement, { swiper: Swiper; track: HTMLElement }>} */
const instanceMap = new WeakMap();
/** @type {Set<HTMLElement>} */
const activeShells = new Set();

function getMobileSlideShells() {
  return document.querySelectorAll('[data-screen-layout-slider]');
}

function getTrack(shell) {
  return shell.querySelector('.list-box, .pill-row');
}

function destroyShell(shell) {
  const record = instanceMap.get(shell);
  if (!record) return;

  const { swiper, track } = record;
  swiper.destroy(true, false);

  [...track.querySelectorAll(':scope > .box')].forEach((box) => {
    box.classList.remove('swiper-slide');
  });

  track.classList.remove('swiper-wrapper');
  shell.classList.remove('swiper');
  delete shell.dataset.screenLayoutSliderInit;

  instanceMap.delete(shell);
  activeShells.delete(shell);
}

function destroyAllScreenLayoutSwipers() {
  [...activeShells].forEach((shell) => destroyShell(shell));
}

function bindVisibilityAutoplay(shell, swiper) {
  if (!('IntersectionObserver' in window)) {
    swiper.autoplay?.start();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) swiper.autoplay?.start();
        else swiper.autoplay?.stop();
      });
    },
    { threshold: 0.08 },
  );

  observer.observe(shell);
}

function createScreenLayoutSwiper(shell) {
  if (shell.dataset.screenLayoutSliderInit === 'true') return;

  const track = getTrack(shell);
  if (!track) return;

  const boxes = [...track.querySelectorAll(':scope > .box')];
  if (boxes.length < 2) return;

  const isPillRow = track.classList.contains('pill-row');

  shell.classList.add('swiper');
  track.classList.add('swiper-wrapper');
  shell.dataset.screenLayoutSliderInit = 'true';

  boxes.forEach((box) => box.classList.add('swiper-slide'));

  const swiper = new Swiper(shell, {
    modules: [Autoplay],
    // loop: boxes.length >= 3,
    loop: false,
    loopPreventsSliding: false,
    slidesPerView: isPillRow ? 2 : 'auto',
    centeredSlides: true,
    spaceBetween: isPillRow ? 20 : 20,
    speed: 550,
    observer: true,
    observeParents: true,
    autoplay: {
      delay: 2800,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
    },
    on: {
      init(s) {
        requestAnimationFrame(() => {
          if (s.params.loop && typeof s.loopFix === 'function') {
            s.loopFix();
          }
          bindVisibilityAutoplay(shell, s);
        });
      },
      resize(s) {
        if (s.params.loop && typeof s.loopFix === 'function') {
          s.loopFix();
        }
      },
    },
  });

  instanceMap.set(shell, { swiper, track });
  activeShells.add(shell);
}

function syncScreenLayoutSwipers() {
  if (!MOBILE_MQ.matches) {
    destroyAllScreenLayoutSwipers();
    return;
  }

  getMobileSlideShells().forEach((shell) => {
    if (instanceMap.has(shell)) return;
    createScreenLayoutSwiper(shell);
  });
}

function initScreenLayoutSwiper() {
  const run = () => syncScreenLayoutSwipers();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }

  window.addEventListener('load', run, { passive: true });

  if (MOBILE_MQ.addEventListener) {
    MOBILE_MQ.addEventListener('change', syncScreenLayoutSwipers);
  } else {
    MOBILE_MQ.addListener(syncScreenLayoutSwipers);
  }
}

initScreenLayoutSwiper();
