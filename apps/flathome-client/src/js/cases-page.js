'use strict';

import { closeSideNavMobilePanel } from '@/js/side-nav-mobile.js';

function setActiveCasesFilter(links, activeLink) {
  links.forEach((link) => {
    link.classList.toggle('is-active', link === activeLink);
  });
}

function applyCasesFilter(board, filter) {
  if (!board) return;

  board.querySelectorAll('[data-cases-category]').forEach((item) => {
    const category = item.dataset.casesCategory;
    const show = filter === 'all' || category === filter;
    item.hidden = !show;
  });
}

function initCasesPage() {
  const nav = document.querySelector('[data-cases-nav]');
  const board = document.querySelector('[data-cases-board]');
  if (!nav || !board) return;

  const filterLinks = nav.querySelectorAll('[data-cases-filter]');
  const defaultLink = nav.querySelector('[data-cases-filter="all"].is-active')
    || nav.querySelector('[data-cases-filter="all"]')
    || nav.querySelector('[data-cases-filter].is-active')
    || filterLinks[0];

  if (defaultLink) {
    setActiveCasesFilter(filterLinks, defaultLink);
    applyCasesFilter(board, defaultLink.dataset.casesFilter);
  }

  filterLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const filter = link.dataset.casesFilter;
      if (!filter) return;

      setActiveCasesFilter(filterLinks, link);
      applyCasesFilter(board, filter);
      closeSideNavMobilePanel(nav);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCasesPage);
} else {
  initCasesPage();
}
