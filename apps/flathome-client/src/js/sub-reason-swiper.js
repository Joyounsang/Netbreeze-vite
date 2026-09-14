'use strict';

import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';

function initSubReasonSwiper() {
  const section = document.querySelector('.sub-reason');
  if (!section) return;

  const swiperEl = section.querySelector('.sub-reason-swiper');
  if (!swiperEl) return;

  new Swiper(swiperEl, {
    modules: [Navigation],
    slidesPerView: 'auto',
    spaceBetween: 54,
    speed: 500,
    roundLengths: true,
    watchOverflow: true,
    breakpoints: {
      0: {
        spaceBetween: 20,
      },
      720: {
        spaceBetween: 40,
      },
      1024: {
        spaceBetween: 54,
      },
    },
    navigation: {
      nextEl: section.querySelector('.main-reason-nav--next'),
      prevEl: section.querySelector('.main-reason-nav--prev'),
    },
  });
}

$(document).ready(initSubReasonSwiper);
