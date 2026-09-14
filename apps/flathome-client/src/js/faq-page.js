'use strict';

function setActiveFilter(links, activeLink) {
  links.forEach((link) => {
    link.classList.toggle('is-active', link === activeLink);
  });
}

function initFaqNav() {
  const nav = document.querySelector('[data-faq-nav]');
  if (!nav) return;

  nav.querySelectorAll('.side-navigation__group').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('li');
      if (!item) return;

      const willOpen = !item.classList.contains('is-open');
      item.classList.toggle('is-open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });

  const filterLinks = nav.querySelectorAll('[data-faq-filter]');
  filterLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const filter = link.dataset.faqFilter;
      if (!filter) return;

      setActiveFilter(filterLinks, link);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFaqNav);
} else {
  initFaqNav();
}
