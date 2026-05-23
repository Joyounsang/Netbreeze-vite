'use strict';

const GNB_CLOSE_DELAY = 120;
const MOBILE_BREAKPOINT = 720;
const GNB_MOBILE_MQ = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

function initGnbMenu() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const toggle = document.getElementById('gnb-toggle');
  const backdrop = header.querySelector('.gnb-mobile-backdrop');
  const items = Array.from(header.querySelectorAll('.gnb-item'));
  let closeTimer = null;

  const isMobile = () => GNB_MOBILE_MQ.matches;

  const clearCloseTimer = () => {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const closeMobilePanels = () => {
    items.forEach((item) => {
      item.classList.remove('is-mobile-open');
      const trigger = item.querySelector('.gnb-link');
      const panel = item.querySelector('.gnb-panel');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
    });
  };

  const closeAll = () => {
    clearCloseTimer();
    items.forEach((item) => {
      item.classList.remove('is-hover', 'is-mobile-open');
      const trigger = item.querySelector('.gnb-link');
      const panel = item.querySelector('.gnb-panel');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
    });
    header.classList.remove('is-menu-open', 'is-mobile-nav-open');
    document.body.classList.remove('is-gnb-locked');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '전체 메뉴 열기');
    }
    if (backdrop) backdrop.hidden = true;
  };

  const openItem = (item) => {
    if (isMobile()) return;

    clearCloseTimer();

    items.forEach((other) => {
      if (other === item) return;
      other.classList.remove('is-hover');
      const otherTrigger = other.querySelector('.gnb-link');
      const otherPanel = other.querySelector('.gnb-panel');
      if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
      if (otherPanel) otherPanel.hidden = true;
    });

    item.classList.add('is-hover');
    const trigger = item.querySelector('.gnb-link');
    const panel = item.querySelector('.gnb-panel');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (panel) panel.hidden = false;
    header.classList.add('is-menu-open');
  };

  const activateMobileItem = (item) => {
    const trigger = item.querySelector('.gnb-link');
    const panel = item.querySelector('.gnb-panel');
    if (!trigger || !panel) return;

    items.forEach((other) => {
      other.classList.remove('is-mobile-open');
      const otherTrigger = other.querySelector('.gnb-link');
      const otherPanel = other.querySelector('.gnb-panel');
      if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
      if (otherPanel) otherPanel.hidden = true;
    });

    item.classList.add('is-mobile-open');
    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
  };

  const getDefaultMobileItem = () => (
    header.querySelector('.gnb-item.on') || items[0]
  );

  const openMobileNav = () => {
    header.classList.add('is-mobile-nav-open', 'is-menu-open');
    document.body.classList.add('is-gnb-locked');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', '전체 메뉴 닫기');
    }
    if (backdrop) backdrop.hidden = false;
    activateMobileItem(getDefaultMobileItem());
  };

  const scheduleClose = () => {
    if (isMobile()) return;
    clearCloseTimer();
    closeTimer = window.setTimeout(closeAll, GNB_CLOSE_DELAY);
  };

  if (toggle) {
    toggle.addEventListener('click', () => {
      if (!isMobile()) return;

      if (header.classList.contains('is-mobile-nav-open')) {
        closeAll();
        return;
      }

      openMobileNav();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeAll);
  }

  items.forEach((item) => {
    const trigger = item.querySelector('.gnb-link');
    const panel = item.querySelector('.gnb-panel');
    if (!trigger || !panel) return;

    item.addEventListener('mouseenter', () => {
      if (!isMobile()) openItem(item);
    });
    item.addEventListener('mouseleave', scheduleClose);

    trigger.addEventListener('focus', () => {
      if (!isMobile()) openItem(item);
    });

    trigger.addEventListener('click', (event) => {
      if (!isMobile()) return;
      event.preventDefault();
      activateMobileItem(item);
    });

    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAll();
        (isMobile() ? toggle : trigger)?.focus();
      }
    });

    panel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAll();
        (isMobile() ? toggle : trigger)?.focus();
      }
    });

    panel.querySelectorAll('a[href]').forEach((link) => {
      link.addEventListener('click', () => {
        if (isMobile()) closeAll();
      });
    });
  });

  header.addEventListener('focusout', (event) => {
    if (isMobile()) return;
    const nextTarget = event.relatedTarget;
    if (!nextTarget || !header.contains(nextTarget)) {
      scheduleClose();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!header.classList.contains('is-menu-open')) return;

    const activeItem = header.querySelector('.gnb-item.is-hover, .gnb-item.is-mobile-open');
    const trigger = activeItem?.querySelector('.gnb-link');
    closeAll();
    (isMobile() ? toggle : trigger)?.focus();
  });

  const handleViewportChange = () => {
    if (!isMobile()) {
      closeAll();
      return;
    }

    closeMobilePanels();
    header.classList.remove('is-hover');

    if (header.classList.contains('is-mobile-nav-open')) {
      activateMobileItem(getDefaultMobileItem());
    }
  };

  if (GNB_MOBILE_MQ.addEventListener) {
    GNB_MOBILE_MQ.addEventListener('change', handleViewportChange);
  } else {
    GNB_MOBILE_MQ.addListener(handleViewportChange);
  }

  window.addEventListener('resize', handleViewportChange, { passive: true });
}

$(document).ready(initGnbMenu);
