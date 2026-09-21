'use strict';

import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const swiperMap = new WeakMap();
const ADD_SERVICE_SPEED = 400;
const ADD_SERVICE_AUTOPLAY_DELAY = 1700;

function fixLoop(swiper) {
  if (!swiper?.params?.loop) return;

  swiper.update();

  if (typeof swiper.loopFix === 'function') {
    swiper.loopFix();
  }
}

function bindAddServiceVisibilityAutoplay(swiperEl, swiper) {
  const observeTarget = swiperEl.closest('.add-service-slide') || swiperEl;

  if (!('IntersectionObserver' in window)) {
    swiper.autoplay?.start();
    return;
  }

  let hasStartedInView = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          swiper.autoplay?.stop();
          return;
        }

        fixLoop(swiper);

        if (!hasStartedInView) {
          hasStartedInView = true;
          swiper.autoplay?.stop();
          requestAnimationFrame(() => {
            swiper.slideNext(ADD_SERVICE_SPEED);
            swiper.autoplay?.start();
          });
          return;
        }

        swiper.autoplay?.start();
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -4% 0px',
    },
  );

  observer.observe(observeTarget);
}

function createAddServiceSwiper(swiperEl) {
  const swiper = new Swiper(swiperEl, {
    modules: [Autoplay],
    loop: true,
    loopPreventsSliding: false,
    slidesPerView: 'auto',
    spaceBetween: 0,
    speed: ADD_SERVICE_SPEED,
    observer: true,
    observeParents: true,
    watchOverflow: false,
    autoplay: {
      delay: ADD_SERVICE_AUTOPLAY_DELAY,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      stopOnLastSlide: false,
      waitForTransition: true,
    },
    on: {
      init(s) {
        requestAnimationFrame(() => {
          fixLoop(s);
          s.autoplay?.stop();
        });
      },
      resize(s) {
        fixLoop(s);
      },
      imagesReady(s) {
        fixLoop(s);
      },
      slideChangeTransitionEnd(s) {
        if (s.destroyed || !s.autoplay || s.autoplay.running) return;

        if (s.params.loop && s.isEnd) {
          fixLoop(s);
        }

        s.autoplay.start();
      },
    },
  });

  bindAddServiceVisibilityAutoplay(swiperEl, swiper);
  swiperMap.set(swiperEl, swiper);
  return swiper;
}

function initAddServiceSwiper() {
  document.querySelectorAll('.add-service-swiper').forEach((swiperEl) => {
    if (swiperMap.has(swiperEl)) return;

    createAddServiceSwiper(swiperEl);
  });
}

function refreshAddServiceSwiper() {
  document.querySelectorAll('.add-service-swiper').forEach((swiperEl) => {
    const swiper = swiperMap.get(swiperEl);
    if (!swiper) return;

    fixLoop(swiper);
  });
}

$(document).ready(() => {
  initAddServiceSwiper();
  window.addEventListener('load', refreshAddServiceSwiper, { once: true });
});
