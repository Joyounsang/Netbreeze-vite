'use strict';

import Swiper from 'swiper';
import { Autoplay, EffectFade, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

function buildProgressSegments(progressRoot, count) {
  if (!progressRoot || progressRoot.children.length) return;

  for (let i = 0; i < count; i += 1) {
    const segment = document.createElement('button');
    segment.type = 'button';
    segment.className = 'slide-progress__segment';
    segment.setAttribute('aria-label', `${i + 1}번째 슬라이드`);
    progressRoot.appendChild(segment);
  }
}

function updateSlideControls(swiper, realSlideCount) {
  const root = swiper.el;
  const fractionEl = root.querySelector('[data-slide-fraction]');
  const progressRoot = root.querySelector('[data-slide-progress]');
  const current = swiper.realIndex + 1;
  const total = realSlideCount;

  if (fractionEl) {
    fractionEl.textContent = `${current}/${total}`;
  }

  progressRoot?.querySelectorAll('.slide-progress__segment').forEach((segment, index) => {
    segment.classList.toggle('is-active', index === swiper.realIndex);
  });
}

function initBannerSwiper() {
  const swiperEl = document.querySelector('.banner-main-swiper');
  if (!swiperEl) return;

  const realSlideCount = swiperEl.querySelectorAll('.swiper-slide').length;
  const progressRoot = swiperEl.querySelector('[data-slide-progress]');

  buildProgressSegments(progressRoot, realSlideCount);

  const swiperInstance = new Swiper(swiperEl, {
    modules: [EffectFade, Navigation, Autoplay],
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    speed: 600,
    loop: true,
    allowTouchMove: false,
    simulateTouch: false,
    grabCursor: false,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: swiperEl.querySelector('.slide-nav__btn--next'),
      prevEl: swiperEl.querySelector('.slide-nav__btn--prev'),
    },
    on: {
      init(swiper) {
        updateSlideControls(swiper, realSlideCount);
      },
      slideChange(swiper) {
        updateSlideControls(swiper, realSlideCount);
      },
    },
  });

  progressRoot?.querySelectorAll('.slide-progress__segment').forEach((segment, index) => {
    segment.addEventListener('click', () => {
      swiperInstance.slideToLoop(index);
    });
  });
}

$(document).ready(initBannerSwiper);
