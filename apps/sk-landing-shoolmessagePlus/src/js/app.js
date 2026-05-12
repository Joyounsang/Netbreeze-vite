'use strict';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

$(document).ready(function () {
  AOS.init();
  $('.scrollbar').scrollbar();

  $(document).on('click', '.price-table .dropDownBtn', function (e) {
    e.preventDefault();
    const btn = this;
    const li = btn.closest('li');
    if (!li) return;

    const willOpen = !li.classList.contains('is-open');
    li.classList.toggle('is-open', willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
  });

  document.querySelectorAll('.price-table .dropDownBtn').forEach(function (btn) {
    btn.setAttribute('aria-expanded', 'false');
  });

  const siteHeader = document.querySelector('header');
  if (siteHeader) {
    function syncHeaderScrollClass() {
      const y = window.scrollY || document.documentElement.scrollTop;
      siteHeader.classList.toggle('scroll', y > 0);
    }
    syncHeaderScrollClass();
    window.addEventListener('scroll', syncHeaderScrollClass, { passive: true });
  }

  const systemRoot = document.querySelector('.app-section.system');
  const systemSwiperEl = document.querySelector('.system-cards-swiper');
  if (systemRoot && systemSwiperEl) {
    const tabItems = systemRoot.querySelectorAll('.tabs li');
    const systemReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    function setActiveTab(realIndex) {
      tabItems.forEach(function (li, i) {
        li.classList.toggle('on', i === realIndex);
      });
    }

    const SYSTEM_INITIAL_INDEX = 2;

    const systemSwiper = new Swiper(systemSwiperEl, {
      modules: [Autoplay],
      // loop: true,
      initialSlide: SYSTEM_INITIAL_INDEX,
      centeredSlides: true,
      slidesPerView: 'auto',
      spaceBetween: 30,
      speed: 450,
      grabCursor: true,
      slideToClickedSlide: false,
      autoplay: systemReducedMotion
        ? false
        : {
            enabled: true,
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            waitForTransition: false,
          },
    });

    setActiveTab(systemSwiper.realIndex);

    systemSwiper.on('slideChange', function () {
      setActiveTab(systemSwiper.realIndex);
    });

    const tabsEl = systemRoot.querySelector('.tabs');
    if (tabsEl) {
      tabsEl.addEventListener('click', function (e) {
        const a = e.target.closest('a');
        if (!a) return;
        e.preventDefault();
        const li = a.closest('li');
        if (!li || !tabsEl.contains(li)) return;
        const idx = Array.prototype.indexOf.call(tabItems, li);
        if (idx < 0) return;
        systemSwiper.slideTo(idx);
      });
    }
  }

  const applicationSwiperEl = document.querySelector('.application-swiper');
  if (applicationSwiperEl) {
    const applicationReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const APPLICATION_START_REAL_INDEX = 3;
    const applicationWrapper =
      applicationSwiperEl.querySelector('.swiper-wrapper');

    if (applicationWrapper) {
      const originals = Array.from(
        applicationWrapper.querySelectorAll('.swiper-slide')
      );
      originals.forEach(function (slide) {
        const copy = slide.cloneNode(true);
        copy.querySelectorAll('[id]').forEach(function (el) {
          el.removeAttribute('id');
        });
        applicationWrapper.appendChild(copy);
      });
    }

    new Swiper(applicationSwiperEl, {
      modules: [Autoplay],
      direction: 'vertical',
      loop: true,
      loopAdditionalSlides: 4,
      loopPreventsSliding: false,
      watchOverflow: false,
      centeredSlides: true,
      slidesPerView: 'auto',
      spaceBetween: 18,
      speed: 600,
      grabCursor: true,
      watchSlidesProgress: true,
      autoplay: applicationReducedMotion
        ? false
        : {
            enabled: false,
            delay: 2000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
            waitForTransition: false,
            stopOnLastSlide: false,
          },
      on: {
        afterInit: function (sw) {
          sw.slideToLoop(APPLICATION_START_REAL_INDEX, 0, false);
          sw.update();
          requestAnimationFrame(function () {
            sw.update();
            if (!applicationReducedMotion && sw.autoplay) {
              sw.params.autoplay.enabled = true;
              sw.autoplay.start();
            }
          });
        },
      },
    });
  }

  const keypointSection = document.querySelector('.app-section.keypoint');
  if (keypointSection) {
    const keypointReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    let rafId = 0;

    function updateParallax(clientX, clientY) {
      const nx = (clientX / window.innerWidth - 0.5) * 2;
      const ny = (clientY / window.innerHeight - 0.5) * 2;
      keypointSection.style.setProperty('--parallax-x', nx.toFixed(4));
      keypointSection.style.setProperty('--parallax-y', ny.toFixed(4));
    }

    function onMouseMove(e) {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(function () {
        updateParallax(e.clientX, e.clientY);
      });
    }

    function resetParallax() {
      keypointSection.style.setProperty('--parallax-x', '0');
      keypointSection.style.setProperty('--parallax-y', '0');
    }

    let keypointParallaxUnlockTimer;

    const keypointIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            keypointSection.classList.add('is-keypoint-bg-inview');
            window.clearTimeout(keypointParallaxUnlockTimer);
            keypointParallaxUnlockTimer = window.setTimeout(function () {
              keypointSection.classList.add('is-keypoint-parallax-unlocked');
              if (!keypointReducedMotion) {
                window.addEventListener('mousemove', onMouseMove, { passive: true });
              }
            }, 1000);
          } else {
            window.clearTimeout(keypointParallaxUnlockTimer);
            keypointSection.classList.remove('is-keypoint-bg-inview');
            keypointSection.classList.remove('is-keypoint-parallax-unlocked');
            if (!keypointReducedMotion) {
              window.removeEventListener('mousemove', onMouseMove);
              cancelAnimationFrame(rafId);
              resetParallax();
            }
          }
        });
      },
      { threshold: 0.12 }
    );

    keypointIo.observe(keypointSection);
  }
});
