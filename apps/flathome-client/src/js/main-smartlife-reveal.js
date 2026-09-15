'use strict';

const SMARTLIFE_MOBILE_MQ = window.matchMedia('(max-width: 720px)');

function initMainSmartlifeReveal() {
  const section = document.querySelector('[data-main-smartlife]');
  if (!section) return;

  const copy = section.querySelector('.main-smartlife-copy');
  const circle = section.querySelector('.main-smartlife-circle');
  if (!copy || !circle) return;

  const clamp01 = (value) => Math.min(1, Math.max(0, value));

  const update = () => {
    const rect = section.getBoundingClientRect();
    const viewport = window.innerHeight;
    const isMobile = SMARTLIFE_MOBILE_MQ.matches;

    let progress;
    let phoneReveal;
    let copyReveal;

    if (isMobile) {
      // 섹션이 올라오는 동안만 연출 (sticky·240vh 없이, 빈 화면 구간 제거)
      const enterStart = viewport * 0.92;
      const enterEnd = viewport * 0.28;
      progress = clamp01((enterStart - rect.top) / (enterStart - enterEnd));
      phoneReveal = clamp01((progress - 0.45) / 0.35);
      copyReveal = clamp01((progress - 0.58) / 0.35);
    } else {
      const scrollable = Math.max(1, section.offsetHeight - viewport);
      progress = clamp01(-rect.top / scrollable);
      phoneReveal = clamp01((progress - 0.52) / 0.22);
      copyReveal = clamp01((progress - 0.64) / 0.22);
    }

    section.style.setProperty('--smartlife-progress', `${progress}`);
    section.style.setProperty('--smartlife-phone-reveal', `${phoneReveal}`);
    section.style.setProperty('--smartlife-copy-reveal', `${copyReveal}`);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

$(document).ready(initMainSmartlifeReveal);
