'use strict';

import Swiper from 'swiper';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

const SLIDE_DURATION_MS = 4000;
const FADE_SPEED_MS = 600;
const PROGRESS_RING_SELECTOR = '.main-hero-progress-ring';
const HERO_PROGRESS_STROKE = 6;

// viewBox를 이미지의 실제 렌더 크기(px)와 1:1로 맞춘다.
// 그래야 stroke-width와 dash 길이가 전부 px 단위로 계산돼 브라우저별 차이가 없다.
function syncHeroProgressFrame(frame) {
  if (!frame) return;

  const img = frame.querySelector('img');
  const svg = frame.querySelector('.main-hero-progress');
  const ring = frame.querySelector(PROGRESS_RING_SELECTOR);
  if (!img || !svg || !ring) return;

  const apply = () => {
    const { width, height } = img.getBoundingClientRect();
    if (!width || !height) return;

    // 선을 이미지 바깥에 두려면 rect를 stroke 절반만큼 밖으로 밀어야 한다.
    const offset = HERO_PROGRESS_STROKE / 2;
    const ringWidth = width + HERO_PROGRESS_STROKE;
    const ringHeight = height + HERO_PROGRESS_STROKE;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    ring.setAttribute('x', String(-offset));
    ring.setAttribute('y', String(-offset));
    ring.setAttribute('width', String(ringWidth));
    ring.setAttribute('height', String(ringHeight));

    const perimeter = (ringWidth + ringHeight) * 2;
    ring.dataset.perimeter = String(perimeter);
    ring.style.strokeDasharray = String(perimeter);
  };

  if (img.complete && img.naturalWidth) {
    apply();
    return;
  }

  img.addEventListener('load', apply, { once: true });
}

function syncAllHeroProgressFrames(root) {
  root.querySelectorAll('[data-hero-frame]').forEach(syncHeroProgressFrame);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setRingProgress(ring, progress) {
  const perimeter = Number(ring.dataset.perimeter) || 0;
  ring.style.strokeDashoffset = String(perimeter * (1 - progress));
}

function initBannerSwiper() {
  const swiperEl = document.querySelector('.banner-main-swiper');
  if (!swiperEl) return;

  const useMotionProgress = !prefersReducedMotion();
  let rafId = 0;
  let cycleIndex = -1;

  const startCycle = (swiper) => {
    if (rafId) cancelAnimationFrame(rafId);

    const ring = swiper.slides[swiper.activeIndex]?.querySelector(PROGRESS_RING_SELECTOR);
    if (!ring) return;

    syncHeroProgressFrame(ring.closest('[data-hero-frame]'));
    setRingProgress(ring, 0);

    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / SLIDE_DURATION_MS);
      setRingProgress(ring, progress);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      rafId = 0;
      swiper.slideNext();
    };

    rafId = requestAnimationFrame(tick);
  };

  new Swiper(swiperEl, {
    modules: [EffectFade, Autoplay],
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    speed: FADE_SPEED_MS,
    loop: true,
    allowTouchMove: false,
    simulateTouch: false,
    grabCursor: false,
    autoplay: useMotionProgress
      ? false
      : {
          delay: SLIDE_DURATION_MS,
          disableOnInteraction: false,
        },
    on: {
      afterInit(swiper) {
        syncAllHeroProgressFrames(swiperEl);
        if (!useMotionProgress) return;

        cycleIndex = swiper.realIndex;
        startCycle(swiper);
      },
      // loopFix()는 runCallbacks:false로 slideTo를 호출하므로 여기서 중복 실행되지 않는다.
      slideChange(swiper) {
        if (!useMotionProgress || swiper.realIndex === cycleIndex) return;

        cycleIndex = swiper.realIndex;
        startCycle(swiper);
      },
    },
  });

  syncAllHeroProgressFrames(swiperEl);
  window.addEventListener('resize', () => syncAllHeroProgressFrames(swiperEl), { passive: true });
}

$(document).ready(initBannerSwiper);
