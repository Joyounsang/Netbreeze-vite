'use strict';

function initLocationMenu() {
  const menus = Array.from(document.querySelectorAll('[data-location-menu]'));
  if (!menus.length) return;

  const closeAll = (except) => {
    menus.forEach((menu) => {
      if (menu === except) return;

      menu.classList.remove('is-open');
      menu.querySelector('.active-value')?.setAttribute('aria-expanded', 'false');
    });
  };

  menus.forEach((menu) => {
    const trigger = menu.querySelector('.active-value');
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
      menu.querySelector('.active-value')?.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeAll();
  });
}

$(document).ready(initLocationMenu);
