'use strict';

const MOBILE_BREAKPOINT = 720;
const MOBILE_MQ = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

/**
 * 모바일 about: app-inner(sticky) + only-mo 실측 높이로 섹션 min-height 산출
 * → only-mo가 끝까지 올라온 뒤 sticky 해제·다음 섹션 진입
 */
function updateAboutSectionMinHeight() {
  const section = document.querySelector('.app-section.about');
  if (!section) return;

  if (!MOBILE_MQ.matches) {
    section.style.removeProperty('--about-section-min');
    return;
  }

  const inner = section.querySelector('.app-inner');
  const mo = section.querySelector('.info-orbit.only-mo');
  if (!inner || !mo) return;

  const total = inner.offsetHeight + mo.offsetHeight;
  section.style.setProperty('--about-section-min', `${total}px`);
}

function initAboutSectionMobile() {
  let resizeObserver = null;

  function bindObservers() {
    const section = document.querySelector('.app-section.about');
    const inner = section?.querySelector('.app-inner');
    const mo = section?.querySelector('.info-orbit.only-mo');
    if (!section || !inner || !mo || !window.ResizeObserver) return;

    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(updateAboutSectionMinHeight);
    resizeObserver.observe(inner);
    resizeObserver.observe(mo);
  }

  updateAboutSectionMinHeight();
  bindObservers();

  window.addEventListener('resize', updateAboutSectionMinHeight, { passive: true });
  window.addEventListener('load', updateAboutSectionMinHeight, { passive: true });

  if (MOBILE_MQ.addEventListener) {
    MOBILE_MQ.addEventListener('change', () => {
      updateAboutSectionMinHeight();
      bindObservers();
    });
  } else {
    MOBILE_MQ.addListener(updateAboutSectionMinHeight);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutSectionMobile);
} else {
  initAboutSectionMobile();
}
