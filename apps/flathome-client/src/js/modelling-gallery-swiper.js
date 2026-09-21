'use strict';

import Swiper from 'swiper';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

const swiperMap = new WeakMap();
const AUTOPLAY_DELAY = 2000;

function fixLoop(swiper) {
  if (!swiper?.params?.loop) return;

  swiper.update();

  if (typeof swiper.loopFix === 'function') {
    swiper.loopFix();
  }
}

const autoplayOptions = {
  delay: AUTOPLAY_DELAY,
  disableOnInteraction: false,
  pauseOnMouseEnter: false,
  stopOnLastSlide: false,
  waitForTransition: true,
};

/** autoplay 전용 — 사용자 드래그·스와이프·키보드 조작 불가 */
const readOnlyInteraction = {
  allowTouchMove: false,
  simulateTouch: false,
  grabCursor: false,
  preventClicks: true,
  preventClicksPropagation: true,
  noSwiping: true,
  keyboard: {
    enabled: false,
  },
};

function bindAutoplayRecovery(swiper) {
  swiper.on('slideChangeTransitionEnd', (s) => {
    if (s.destroyed || !s.autoplay) return;

    const galleryEl = s.el.closest('.modelling-gallery');
    if (!galleryEl) return;

    const rect = galleryEl.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!isVisible || s.autoplay.running) return;

    if (s.params.loop && s.isEnd) {
      fixLoop(s);
    }

    s.autoplay.start();
  });
}

function createModellingGallerySwiper(swiperEl) {
  const swiper = new Swiper(swiperEl, {
    modules: [Autoplay],
    ...readOnlyInteraction,
    loop: true,
    // loopAdditionalSlides: 3,
    loopPreventsSliding: false,
    slidesPerView: 'auto',
    centeredSlides: true,
    centeredSlidesBounds: false,
    spaceBetween: 26,
    speed: 600,
    observer: true,
    observeParents: true,
    watchOverflow: false,
    autoplay: autoplayOptions,
    // on: {
    //   init(s) {
    //     s.autoplay.stop();
    //     requestAnimationFrame(() => fixLoop(s));
    //   },
    //   resize(s) {
    //     fixLoop(s);
    //   },
    //   imagesReady(s) {
    //     fixLoop(s);
    //   },
    // },
  });

  bindAutoplayRecovery(swiper);
  swiperMap.set(swiperEl, swiper);
  return swiper;
}

function createModellingGalleryDeviceSwiper(swiperEl) {
  const swiper = new Swiper(swiperEl, {
    modules: [Autoplay, EffectFade],
    ...readOnlyInteraction,
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    loop: true,
    loopAdditionalSlides: 2,
    loopPreventsSliding: false,
    slidesPerView: 1,
    speed: 800,
    observer: true,
    observeParents: true,
    watchOverflow: false,
    autoplay: autoplayOptions,
    on: {
      init(s) {
        s.autoplay.stop();
        requestAnimationFrame(() => fixLoop(s));
      },
      resize(s) {
        fixLoop(s);
      },
      imagesReady(s) {
        fixLoop(s);
      },
    },
  });

  bindAutoplayRecovery(swiper);
  swiperMap.set(swiperEl, swiper);
  return swiper;
}

function getOrCreateSwiper(swiperEl, galleryEl) {
  if (swiperMap.has(swiperEl)) {
    return swiperMap.get(swiperEl);
  }

  const isDeviceType = galleryEl?.classList.contains('type-device');
  return isDeviceType
    ? createModellingGalleryDeviceSwiper(swiperEl)
    : createModellingGallerySwiper(swiperEl);
}

function setupGalleryObserver(galleryEl) {
  if (galleryEl.dataset.galleryObserverInit === 'true') return;

  galleryEl.dataset.galleryObserverInit = 'true';

  const swiperEl = galleryEl.querySelector('.modelling-gallery-swiper');
  if (!swiperEl) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const startSwiper = () => {
    const swiper = getOrCreateSwiper(swiperEl, galleryEl);
    fixLoop(swiper);

    if (!reduceMotion) {
      swiper.autoplay?.start();
    }
  };

  const stopSwiper = () => {
    swiperMap.get(swiperEl)?.autoplay?.stop();
  };

  if (!('IntersectionObserver' in window)) {
    startSwiper();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startSwiper();
        } else {
          stopSwiper();
        }
      });
    },
    {
      threshold: 0.25,
      rootMargin: '0px 0px -5% 0px',
    },
  );

  observer.observe(galleryEl);
}

function initModellingGallerySwiper() {
  document.querySelectorAll('.modelling-gallery').forEach(setupGalleryObserver);
}

function refreshVisibleGalleries() {
  document.querySelectorAll('.modelling-gallery').forEach((galleryEl) => {
    const swiperEl = galleryEl.querySelector('.modelling-gallery-swiper');
    if (!swiperEl || !swiperMap.has(swiperEl)) return;

    const rect = galleryEl.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    const swiper = swiperMap.get(swiperEl);

    fixLoop(swiper);

    if (isVisible) {
      swiper.autoplay?.start();
    }
  });
}

$(document).ready(() => {
  initModellingGallerySwiper();
  window.addEventListener('load', refreshVisibleGalleries, { once: true });
});
