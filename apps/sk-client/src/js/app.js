'use strict';
import '@/js/skip-nav.js';
import '@/js/header.js';
import '@/js/scroll-to-top.js';
import '@/js/banner-swiper.js';
import '@/js/service-drag.js';
import '@/js/about-infography.js';
import '@/js/about-orbit-rings.js';
import '@/js/about-typing.js';
import '@/js/video-service.js';
import '@/js/board-faq.js';
import '@/js/notice-slider.js';
import '@/js/fee-sticky-tabs.js';
import '@/js/product-swiper.js';
import '@/js/features-swiper.js';
import '@/js/application-swiper.js';
import '@/js/keypoint-exa-img.js';
import '@/js/banner-ad-rise.js';

$(document).ready(function () {
  AOS.init();
  $('.scrollbar').scrollbar();
  clickModal();
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
