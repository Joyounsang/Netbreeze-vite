'use strict';

import Swiper from 'swiper';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';

const MOBILE_BREAKPOINT = 720;
const MOBILE_MQ = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

const swiperMap = new WeakMap();

function createFeaturesSwiper(swiperEl) {
  const section = swiperEl.closest('.app-section');
  const prevEl = section?.querySelector('.slide-controls .slide-nav__btn--prev');
  const nextEl = section?.querySelector('.slide-controls .slide-nav__btn--next');

  return new Swiper(swiperEl, {
    modules: [Autoplay, Navigation],
    slidesPerView: 'auto',
    spaceBetween: 20,
    speed: 500,
    loop: false,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    navigation: {
      prevEl,
      nextEl,
    },
  });
}

function destroyFeaturesSwiper(swiperEl) {
  const instance = swiperMap.get(swiperEl);
  if (!instance) return;

  instance.destroy(true, true);
  swiperMap.delete(swiperEl);
  delete swiperEl.dataset.featuresSwiperInit;
}

function initFeaturesSwiperEl(swiperEl) {
  if (MOBILE_MQ.matches) {
    destroyFeaturesSwiper(swiperEl);
    return;
  }

  if (swiperMap.has(swiperEl)) return;

  swiperEl.dataset.featuresSwiperInit = 'true';
  swiperMap.set(swiperEl, createFeaturesSwiper(swiperEl));
}

function initFeaturesSwiper() {
  document.querySelectorAll('.features-swiper').forEach(initFeaturesSwiperEl);

  const onViewportChange = () => {
    document.querySelectorAll('.features-swiper').forEach(initFeaturesSwiperEl);
  };

  if (MOBILE_MQ.addEventListener) {
    MOBILE_MQ.addEventListener('change', onViewportChange);
  } else {
    MOBILE_MQ.addListener(onViewportChange);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeaturesSwiper);
} else {
  initFeaturesSwiper();
}
