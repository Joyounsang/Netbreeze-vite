'use strict';

import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const swiperMap = new WeakMap();

function fixLoop(swiper) {
  if (!swiper?.params?.loop) return;

  swiper.update();

  if (typeof swiper.loopFix === 'function') {
    swiper.loopFix();
  }
}

function createAddServiceSwiper(swiperEl) {
  const swiper = new Swiper(swiperEl, {
    modules: [Autoplay],
    loop: true,
    // loopAdditionalSlides: 5,
    loopPreventsSliding: false,
    slidesPerView: 'auto',
    spaceBetween: 0,
    speed: 600,
    observer: true,
    observeParents: true,
    watchOverflow: false,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      stopOnLastSlide: false,
      waitForTransition: true,
    },
    on: {
      init(s) {
        requestAnimationFrame(() => fixLoop(s));
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
    swiper.autoplay?.start();
  });
}

$(document).ready(() => {
  initAddServiceSwiper();
  window.addEventListener('load', refreshAddServiceSwiper, { once: true });
});
