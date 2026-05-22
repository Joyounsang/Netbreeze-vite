'use strict';

function ensureMainContentTarget() {
  const existing = document.getElementById('main-content');
  if (existing) {
    if (!existing.hasAttribute('tabindex')) {
      existing.setAttribute('tabindex', '-1');
    }
    return existing;
  }

  const main = document.querySelector('main');
  if (main) {
    main.id = 'main-content';
    main.setAttribute('tabindex', '-1');
    return main;
  }

  const container = document.querySelector('.viewport > .container');
  if (container) {
    container.id = 'main-content';
    container.setAttribute('tabindex', '-1');
    return container;
  }

  return null;
}

function focusSkipTarget(target) {
  if (!target) return;
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'start' });
}

function initSkipNav() {
  ensureMainContentTarget();

  document.querySelectorAll('.skip-nav a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href')?.slice(1);
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      focusSkipTarget(target);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSkipNav);
} else {
  initSkipNav();
}
