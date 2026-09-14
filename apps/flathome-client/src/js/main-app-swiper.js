'use strict';

import Swiper from 'swiper';
import 'swiper/css';

const NAV_DURATION_MS = 6000;
const INNER_SLIDE_INTERVAL_MS = 2000;
const PREVIEW_TRANSITION_MS = 550;

function resetNavBar(bar) {
  if (!bar) return;

  bar.classList.remove('is-animating');
  bar.style.animation = 'none';
  bar.style.width = '0%';
}

function animateNavBar(bar) {
  if (!bar) return;

  resetNavBar(bar);
  void bar.offsetWidth;
  bar.style.removeProperty('animation');
  bar.classList.add('is-animating');
}

function initMainAppSection(section) {
  if (section.dataset.mainAppInit === 'true') return;

  const navItems = Array.from(section.querySelectorAll('[data-main-app-trigger]'));
  const previewItems = Array.from(section.querySelectorAll('.main-app__item'));
  if (!previewItems.length) return;

  section.dataset.mainAppInit = 'true';
  section.style.setProperty('--main-app-nav-duration', `${NAV_DURATION_MS}ms`);
  section.style.setProperty('--main-app-preview-duration', `${PREVIEW_TRANSITION_MS}ms`);

  const swipers = previewItems.map((item) => {
    const swiperEl = item.querySelector('.main-app-swiper');
    if (!swiperEl || swiperEl.dataset.mainAppSwiperInit === 'true') return null;

    swiperEl.dataset.mainAppSwiperInit = 'true';

    return new Swiper(swiperEl, {
      effect: 'slide',
      speed: 400,
      allowTouchMove: false,
      simulateTouch: false,
    });
  });

  if (!navItems.length) {
    previewItems.forEach((item, index) => {
      item.classList.toggle('is-active', index === 0);
    });
    swipers[0]?.slideTo(0, 0);
    return;
  }

  let cycleToken = 0;
  const timers = [];

  const clearTimers = () => {
    while (timers.length) {
      window.clearTimeout(timers.pop());
    }
  };

  const scheduleTimer = (callback, delay) => {
    const id = window.setTimeout(callback, delay);
    timers.push(id);
    return id;
  };

  const scheduleInnerSlides = (swiper, token) => {
    if (!swiper) return;

    swiper.slideTo(0, 0);

    const slideCount = swiper.slides.length;
    for (let step = 1; step < slideCount; step += 1) {
      scheduleTimer(() => {
        if (token !== cycleToken) return;
        swiper.slideNext();
      }, INNER_SLIDE_INTERVAL_MS * step);
    }
  };

  const activate = (index) => {
    clearTimers();
    cycleToken += 1;
    const token = cycleToken;

    navItems.forEach((item, i) => {
      const isActive = i === index;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-current', isActive ? 'true' : 'false');

      if (!isActive) resetNavBar(item.querySelector('.main-app-nav__bar'));
    });

    previewItems.forEach((item, i) => {
      item.classList.toggle('is-active', i === index);
    });

    animateNavBar(navItems[index]?.querySelector('.main-app-nav__bar'));
    scheduleInnerSlides(swipers[index], token);

    scheduleTimer(() => {
      if (token !== cycleToken) return;
      activate((index + 1) % navItems.length);
    }, NAV_DURATION_MS);
  };

  navItems.forEach((item, index) => {
    item.addEventListener('click', () => activate(index));
  });

  activate(0);
}

function initMainAppSwiper() {
  document.querySelectorAll('.main-app').forEach(initMainAppSection);
}

$(document).ready(initMainAppSwiper);
