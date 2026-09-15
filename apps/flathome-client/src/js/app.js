'use strict';
import '@/js/skip-nav.js';
import '@/js/header.js';
import '@/js/location-menu.js';
import '@/js/footer-related.js';
import '@/js/scroll-to-top.js';
import '@/js/banner-swiper.js';
import '@/js/main-app-swiper.js';
import '@/js/main-service-sticky.js';
import '@/js/main-reason-swiper.js';
import '@/js/sub-reason-swiper.js';
import '@/js/modelling-gallery-swiper.js';
import '@/js/add-service-swiper.js';
import '@/js/motion-screen.js';
import '@/js/main-smartlife-reveal.js';
import '@/js/board-faq.js';
import '@/js/side-nav-mobile.js';
import '@/js/faq-page.js';
import '@/js/cases-page.js';
import '@/js/contact-service-select.js';
import '@/js/contact-file-field.js';

const MOBILE_BREAKPOINT = 720;

function withRaf(fn) {
  let scheduled = false;
  return (...args) => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      fn(...args);
    });
  };
}

document.addEventListener('DOMContentLoaded', () => {
  window.AOS?.init?.();
  // $('.scrollbar').scrollbar();
  clickModal();
  // 약간의 지연 후 이미지 스위치(초기 렌더 보정)
  // setTimeout(switchImages, 300);

  // 리사이즈·방향 전환 시 이미지 스위치
  // const handleResize = withRaf(switchImages);
  // window.addEventListener('resize', handleResize, { passive: true });
  // window.addEventListener('orientationchange', handleResize, { passive: true });
});


function modalSize() {
  $('.modal').each(function () {
    const layerHeight = $(this).outerHeight();
    $(this).css({
      marginTop: -layerHeight / 2
    });
  });
}

function clickModal() {
  $('.modalLoad').on('click', function (e) {
    e.preventDefault();
    const $target = $($(this).attr('href'));
    // show
    $target.removeClass('hide-animation');
    $('html').addClass('overflow');
    $target.addClass('on');

    // option
    modalSize();

    $target.find(".modalClose").on('click', function (e) {
      e.preventDefault();
      $target.addClass('hide-animation');
      // hide
      setTimeout(function () {
        $('html').removeClass('overflow');
        $target.removeClass('on');
      }, 400);
      $(this).off('click');
    });

    $(".modalCloseAll").on('click', function (e) {
      e.preventDefault();
      $('.modal').addClass('hide-animation');
      // hide
      setTimeout(function () {
        $('html').removeClass('overflow');
        $('.modal').removeClass('on');
      }, 400);
      $(this).off('click');
    });
  });
}

// -------------------------
// Responsive Image Switch
// -------------------------
const switchImages = () => {
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  $('.responsive').each(function () {
    const $img = $(this);
    const src = $img.attr('src') ?? '';
    const isMo = src.endsWith('-mo.png') || src.endsWith('-mo.jpg');

    if (isMobile) {
      if (!isMo) {
        const next = src.replace('.png', '-mo.png').replace('.jpg', '-mo.jpg');
        $img.attr('src', next);
      }
      return;
    }

    const next = src.replace('-mo.png', '.png').replace('-mo.jpg', '.jpg');
    if (next !== src) $img.attr('src', next);
  });
};
