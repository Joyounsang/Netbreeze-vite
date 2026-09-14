'use strict';

function markBannerSectionsWithAd() {
  document.querySelectorAll('.app-section.banner').forEach((section) => {
    if (section.querySelector('.banner-ad')) {
      section.classList.add('banner--has-ad');
    }
  });
}

function initBannerAdRise() {
  const sections = document.querySelectorAll('.app-section.banner[data-banner-ad-rise]');
  if (!sections.length) return;

  sections.forEach((section) => {
    if (section.dataset.bannerAdRiseInit === 'true') return;
    section.dataset.bannerAdRiseInit = 'true';

    const ad = section.querySelector('.banner-ad-rise');
    if (!ad) return;

    function reveal() {
      ad.classList.add('is-visible');
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      reveal();
      return;
    }

    if (!('IntersectionObserver' in window)) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const rect = entry.boundingClientRect;
          const viewportHeight = window.innerHeight;

          // 배너 광고 바가 뷰포트 안으로 들어왔을 때만 실행
          if (rect.top > viewportHeight) return;

          reveal();
          observer.disconnect();
        });
      },
      {
        threshold: [0, 0.1, 0.25],
      },
    );

    observer.observe(ad);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    markBannerSectionsWithAd();
    initBannerAdRise();
  });
} else {
  markBannerSectionsWithAd();
  initBannerAdRise();
}
