'use strict';

import Swiper from 'swiper';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';

function initFeaturesSwiper() {
  document.querySelectorAll('.features-swiper').forEach((swiperEl) => {
    if (swiperEl.dataset.featuresSwiperInit === 'true') return;

    const section = swiperEl.closest('.app-section');
    const prevEl = section?.querySelector('.slide-controls .slide-nav__btn--prev');
    const nextEl = section?.querySelector('.slide-controls .slide-nav__btn--next');

    swiperEl.dataset.featuresSwiperInit = 'true';

    new Swiper(swiperEl, {
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
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeaturesSwiper);
} else {
  initFeaturesSwiper();
}
