'use strict';

function initFooterRelated() {
  const menus = Array.from(document.querySelectorAll('[data-footer-related]'));
  if (!menus.length) return;

  const closeAll = (except) => {
    menus.forEach((menu) => {
      if (menu === except) return;

      menu.classList.remove('is-open');
      menu.querySelector('.footer-related')?.setAttribute('aria-expanded', 'false');
    });
  };

  menus.forEach((menu) => {
    const trigger = menu.querySelector('.footer-related');
    if (!trigger) return;

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = menu.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      if (isOpen) closeAll(menu);
    });
  });

  document.addEventListener('click', (event) => {
    menus.forEach((menu) => {
      if (!menu.classList.contains('is-open')) return;
      if (menu.contains(event.target)) return;

      menu.classList.remove('is-open');
      menu.querySelector('.footer-related')?.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeAll();
  });
}

$(document).ready(initFooterRelated);
