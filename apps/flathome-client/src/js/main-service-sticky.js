'use strict';

function initMainServiceSticky() {
  const section = document.querySelector('[data-main-service]');
  if (!section) return;

  const list = section.querySelector('.main-service-list');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('.main-service-item'));
  if (!items.length) return;

  const update = () => {
    const rect = section.getBoundingClientRect();
    const viewport = window.innerHeight;
    const scrollable = section.offsetHeight - viewport;
    if (scrollable <= 0) {
      list.style.setProperty('--service-shift', '0px');
      return;
    }

    const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
    const maxShift = list.scrollHeight - section.querySelector('.main-service-stage')?.clientHeight || 0;
    const shift = maxShift > 0 ? maxShift * progress : 0;
    list.style.setProperty('--service-shift', `-${shift}px`);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

$(document).ready(initMainServiceSticky);
