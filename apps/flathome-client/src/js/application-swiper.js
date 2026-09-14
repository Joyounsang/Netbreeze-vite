'use strict';

import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

function initApplicationSwiper() {
  document.querySelectorAll('.application-swiper').forEach((swiperEl) => {
    if (swiperEl.dataset.applicationSwiperInit === 'true') return;

    swiperEl.dataset.applicationSwiperInit = 'true';

    new Swiper(swiperEl, {
      modules: [Autoplay],
      direction: 'vertical',
      loop: true,
      slidesPerView: 3,
      centeredSlides: true,
      spaceBetween: 20,
      speed: 600,
      allowTouchMove: false,
      simulateTouch: false,
      grabCursor: false,
      autoplay: {
        delay: 2200,
        disableOnInteraction: false,
      },
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApplicationSwiper);
} else {
  initApplicationSwiper();
}
