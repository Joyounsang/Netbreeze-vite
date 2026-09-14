'use strict';

import Swiper from 'swiper';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';

function initProductSwiper() {
  document.querySelectorAll('.product-swiper').forEach((swiperEl) => {
    if (swiperEl.dataset.productSwiperInit === 'true') return;

    const scope = swiperEl.closest('.stickyContents') || swiperEl.parentElement;
    const prevEl = scope?.querySelector('.slide-nav__btn--prev');
    const nextEl = scope?.querySelector('.slide-nav__btn--next');

    swiperEl.dataset.productSwiperInit = 'true';

    new Swiper(swiperEl, {
      modules: [Autoplay, Navigation],
      slidesPerView: 'auto',
      spaceBetween: 20,
      speed: 500,
      loop: true,
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
  document.addEventListener('DOMContentLoaded', initProductSwiper);
} else {
  initProductSwiper();
}
