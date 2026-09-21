'use strict';

function initMainSmartlifeReveal() {
  const section = document.querySelector('[data-main-smartlife]');
  if (!section) return;

  if (section.dataset.mainSmartlifeInit === 'true') return;
  section.dataset.mainSmartlifeInit = 'true';

  const target = section.querySelector('.main-smartlife-circle');
  if (!target) return;

  const reveal = () => {
    section.classList.add('is-visible');
  };

  const isInRevealZone = (entry) => {
    if (!entry.isIntersecting) return false;
    // 원이 화면에 충분히 들어온 뒤에만 시작 (섹션 패딩만 보일 때 트리거 방지)
    return entry.intersectionRatio >= 0.45;
  };

  if (!('IntersectionObserver' in window)) {
    const onScroll = () => {
      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
      const ratio = visibleHeight / Math.max(rect.height, 1);

      if (ratio < 0.45) return;

      reveal();
      window.removeEventListener('scroll', onScroll, { passive: true });
      window.removeEventListener('resize', onScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!isInRevealZone(entry)) return;

        reveal();
        observer.disconnect();
      });
    },
    {
      threshold: [0, 0.25, 0.45, 0.6, 0.75, 1],
      rootMargin: '0px 0px -10% 0px',
    },
  );

  observer.observe(target);
}

$(document).ready(initMainSmartlifeReveal);
