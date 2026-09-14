'use strict';

import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';

const REASON_GROUP_INDEX = {
  resident: 0,
  office: 2,
  company: 4,
};

function initMainReasonSwiper() {
  const section = document.querySelector('.main-reason');
  if (!section) return;

  const swiperEl = section.querySelector('.main-reason-swiper');
  const tabsRoot = section.querySelector('[data-main-reason-tabs]');
  if (!swiperEl) return;

  const swiperInstance = new Swiper(swiperEl, {
    modules: [Navigation],
    slidesPerView: 3,
    spaceBetween: 80,
    speed: 500,
    roundLengths: true,
    watchOverflow: true,
    breakpoints: {
      0: {
        slidesPerView: 1.15,
        spaceBetween: 20,
      },
      720: {
        slidesPerView: 2,
        spaceBetween: 40,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 80,
      },
    },
    navigation: {
      nextEl: section.querySelector('.main-reason-nav--next'),
      prevEl: section.querySelector('.main-reason-nav--prev'),
    },
  });

  if (!tabsRoot) return;

  const tabButtons = Array.from(tabsRoot.querySelectorAll('[data-reason-filter]'));

  const applyFilter = (filter) => {
    tabButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.reasonFilter === filter);
    });

    const targetIndex = REASON_GROUP_INDEX[filter] ?? 0;
    swiperInstance.slideTo(targetIndex);
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.reasonFilter));
  });

  applyFilter(
    tabButtons.find((btn) => btn.classList.contains('is-active'))?.dataset.reasonFilter || 'resident',
  );
}

$(document).ready(initMainReasonSwiper);
