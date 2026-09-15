'use strict';

import { closeSideNavMobilePanel } from '@/js/side-nav-mobile.js';

function setActiveFilter(triggers, activeTrigger) {
  triggers.forEach((trigger) => {
    trigger.classList.toggle('is-active', trigger === activeTrigger);
  });
}

function applyFaqFilter(board, filter) {
  if (!board) return;

  board.querySelectorAll('li[data-faq-category]').forEach((item) => {
    const category = item.dataset.faqCategory;
    const show = filter === 'all' || category === filter;
    item.hidden = !show;
    if (!show) {
      item.classList.remove('is-open');
    }
  });

  board.querySelectorAll('.list-board.dropdown > ul').forEach((list) => {
    const hasVisible = list.querySelector('li[data-faq-category]:not([hidden])');
    list.hidden = !hasVisible;
  });
}

function initFaqNav() {
  const nav = document.querySelector('[data-faq-nav]');
  const board = document.querySelector('[data-faq-board]');
  if (!nav || !board) return;

  nav.querySelectorAll('.side-navigation__group').forEach((btn) => {
    const item = btn.closest('li');
    if (item) {
      btn.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
    }

    btn.addEventListener('click', () => {
      if (!item) return;

      const willOpen = !item.classList.contains('is-open');
      const list = item.closest('.side-navigation__list');

      if (list && willOpen) {
        list.querySelectorAll(':scope > li.is-open').forEach((openItem) => {
          if (openItem === item) return;
          openItem.classList.remove('is-open');
          const otherBtn = openItem.querySelector('.side-navigation__group');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });
      }

      item.classList.toggle('is-open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });

  const filterTriggers = nav.querySelectorAll('[data-faq-filter]');
  const defaultTrigger = nav.querySelector('[data-faq-filter="all"].is-active')
    || nav.querySelector('[data-faq-filter="all"]');

  if (defaultTrigger) {
    applyFaqFilter(board, defaultTrigger.dataset.faqFilter);
  }

  filterTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();

      const filter = trigger.dataset.faqFilter;
      if (!filter) return;

      setActiveFilter(filterTriggers, trigger);
      applyFaqFilter(board, filter);
      closeSideNavMobilePanel(nav);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFaqNav);
} else {
  initFaqNav();
}
