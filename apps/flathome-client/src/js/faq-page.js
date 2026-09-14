'use strict';

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
    if (item && !item.classList.contains('is-open') && btn.getAttribute('aria-expanded') === 'true') {
      item.classList.add('is-open');
    }

    btn.addEventListener('click', () => {
      if (!item) return;

      const willOpen = !item.classList.contains('is-open');
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
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFaqNav);
} else {
  initFaqNav();
}
