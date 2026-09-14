'use strict';

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
    const scrollable = Math.max(1, section.offsetHeight - viewport);
    const progress = clamp01(-rect.top / scrollable);
    const phoneReveal = clamp01((progress - 0.52) / 0.22);
    const copyReveal = clamp01((progress - 0.64) / 0.22);

    section.style.setProperty('--smartlife-progress', `${progress}`);
    section.style.setProperty('--smartlife-phone-reveal', `${phoneReveal}`);
    section.style.setProperty('--smartlife-copy-reveal', `${copyReveal}`);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

$(document).ready(initMainSmartlifeReveal);
