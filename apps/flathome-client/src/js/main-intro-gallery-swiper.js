'use strict';

import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const MIN_SLIDES = 5;
const DESKTOP_SLIDE_MIN = 6;
const MOBILE_BREAKPOINT = 721;
const DESKTOP_SLIDES_PER_VIEW = 5;

function fixLoop(swiper) {
  if (!swiper?.params?.loop) return;

  swiper.update();

  if (typeof swiper.loopFix === 'function') {
    swiper.loopFix();
  }
}

function isDesktopViewport() {
  return window.innerWidth >= MOBILE_BREAKPOINT;
}

function shouldRunAutoplay(slideCount) {
  if (isDesktopViewport()) return slideCount >= DESKTOP_SLIDE_MIN;
  return slideCount >= MIN_SLIDES;
}

function syncSliderMode(swiper, slideCount) {
  const desktopStatic = isDesktopViewport() && slideCount < DESKTOP_SLIDE_MIN;

  swiper.params.allowTouchMove = !desktopStatic;
  swiper.allowTouchMove = !desktopStatic;

  if (shouldRunAutoplay(slideCount)) {
    swiper.autoplay?.start();
  } else {
    swiper.autoplay?.stop();
  }
}

function bindVisibilityAutoplay(swiperEl, swiper, slideCount) {
  if (!('IntersectionObserver' in window)) {
    syncSliderMode(swiper, slideCount);
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          swiper.autoplay?.stop();
          return;
        }

        fixLoop(swiper);
        syncSliderMode(swiper, slideCount);
      });
    },
    { threshold: 0.15 }
  );

  observer.observe(swiperEl);
}

function initMainIntroGallerySwiper() {
  const wrap = document.querySelector('[data-main-intro-gallery]');
  if (!wrap || wrap.dataset.mainIntroGalleryInit === 'true') return;

  const list = wrap.querySelector('.main-intro-gallery');
  const swiperEl = wrap.querySelector('.main-intro-gallery-swiper');
  if (!list || !swiperEl) return;

  const slides = list.querySelectorAll('li');
  if (slides.length < MIN_SLIDES) return;

  const slideCount = slides.length;

  wrap.dataset.mainIntroGalleryInit = 'true';
  wrap.classList.add('is-slider');
  wrap.classList.toggle('is-slider--desktop-static', slideCount < DESKTOP_SLIDE_MIN);
  list.classList.add('swiper-wrapper');
  slides.forEach(slide => slide.classList.add('swiper-slide'));

  const swiper = new Swiper(swiperEl, {
    modules: [Autoplay],
    loop: slideCount >= DESKTOP_SLIDE_MIN,
    loopPreventsSliding: false,
    speed: 650,
    roundLengths: true,
    observer: true,
    observeParents: true,
    autoplay: {
      delay: 2800,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    breakpoints: {
      0: {
        slidesPerView: 1.12,
        centeredSlides: true,
        spaceBetween: 14,
      },
      [MOBILE_BREAKPOINT]: {
        slidesPerView: DESKTOP_SLIDES_PER_VIEW,
        centeredSlides: false,
        spaceBetween: 0,
      },
    },
    on: {
      init(s) {
        requestAnimationFrame(() => {
          fixLoop(s);
          syncSliderMode(s, slideCount);
        });
      },
      resize(s) {
        fixLoop(s);
        syncSliderMode(s, slideCount);
      },
      breakpoint(s) {
        fixLoop(s);
        syncSliderMode(s, slideCount);
      },
      imagesReady(s) {
        fixLoop(s);
      },
      slideChangeTransitionEnd(s) {
        if (s.destroyed || !s.autoplay || s.autoplay.running) return;
        if (!shouldRunAutoplay(slideCount)) return;
        fixLoop(s);
        s.autoplay.start();
      },
    },
  });

  bindVisibilityAutoplay(swiperEl, swiper, slideCount);
}

$(document).ready(initMainIntroGallerySwiper);
