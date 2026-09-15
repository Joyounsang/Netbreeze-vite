'use strict';

const SIDE_NAV_MOBILE_MQ = window.matchMedia('(max-width: 720px)');

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSideNavMobileDrawer);
} else {
  initSideNavMobileDrawer();
}
