'use strict';

const SIDE_NAV_MOBILE_MQ = window.matchMedia('(max-width: 720px)');

/** 사이드 네비 카테고리·필터 클릭 시 공통 스크롤 (FAQ, 도입사례 등) */
const SIDE_NAV_MENU_SELECTOR =
  '.side-navigation [data-faq-filter], .side-navigation [data-cases-filter]';

export function scrollPageToTop() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
}

function initSideNavMenuScrollTop() {
  document.querySelectorAll('.side-navigation').forEach((nav) => {
    nav.addEventListener('click', (event) => {
      const menu = event.target.closest(SIDE_NAV_MENU_SELECTOR);
      if (!menu || !nav.contains(menu)) return;
      scrollPageToTop();
    });
  });
}

function getSideNavPanel(toggle) {
  const panelId = toggle.getAttribute('aria-controls');
  return panelId ? document.getElementById(panelId) : null;
}

export function closeSideNavMobilePanel(navRoot) {
  if (!SIDE_NAV_MOBILE_MQ.matches) return;

  const root = navRoot || document;
  root.querySelectorAll('[data-side-nav-mobile-toggle]').forEach((toggle) => {
    const panel = getSideNavPanel(toggle);
    const nav = toggle.closest('.side-navigation');
    toggle.setAttribute('aria-expanded', 'false');
    if (panel) panel.hidden = true;
    nav?.classList.remove('is-mobile-panel-open');
  });
}

function syncSideNavMobilePanel(toggle, panel) {
  const nav = toggle.closest('.side-navigation');
  const isMobile = SIDE_NAV_MOBILE_MQ.matches;

  if (!isMobile) {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    nav?.classList.add('is-mobile-panel-open');
    return;
  }

  const open = toggle.getAttribute('aria-expanded') === 'true';
  panel.hidden = !open;
  nav?.classList.toggle('is-mobile-panel-open', open);
}

function initSideNavMobileDrawer() {
  document.querySelectorAll('[data-side-nav-mobile-toggle]').forEach((toggle) => {
    const panel = getSideNavPanel(toggle);
    if (!panel) return;

    if (SIDE_NAV_MOBILE_MQ.matches) {
      toggle.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
    }

    toggle.addEventListener('click', () => {
      if (!SIDE_NAV_MOBILE_MQ.matches) return;

      const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(willOpen));
      panel.hidden = !willOpen;
      toggle.closest('.side-navigation')?.classList.toggle('is-mobile-panel-open', willOpen);
    });

    const onViewportChange = () => syncSideNavMobilePanel(toggle, panel);

    if (SIDE_NAV_MOBILE_MQ.addEventListener) {
      SIDE_NAV_MOBILE_MQ.addEventListener('change', onViewportChange);
    } else {
      SIDE_NAV_MOBILE_MQ.addListener(onViewportChange);
    }

    syncSideNavMobilePanel(toggle, panel);
  });
}

function initSideNav() {
  initSideNavMobileDrawer();
  initSideNavMenuScrollTop();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSideNav);
} else {
  initSideNav();
}
