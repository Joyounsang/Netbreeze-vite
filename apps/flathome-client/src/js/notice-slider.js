'use strict';

import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

function initNoticeSlider() {
  const swiperEl = document.querySelector('[data-notice-swiper]');
  if (!swiperEl) return;

  const slideCount = swiperEl.querySelectorAll('.swiper-slide').length;
  if (slideCount < 2) return;

  new Swiper(swiperEl, {
    modules: [Autoplay],
    direction: 'vertical',
    loop: true,
    slidesPerView: 1,
    spaceBetween: 20,
    speed: 600,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    allowTouchMove: false,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNoticeSlider);
} else {
  initNoticeSlider();
}
