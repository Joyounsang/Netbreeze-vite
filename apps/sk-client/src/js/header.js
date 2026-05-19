'use strict';

const GNB_CLOSE_DELAY = 120;

function initGnbMenu() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const items = Array.from(header.querySelectorAll('.gnb-item'));
  let closeTimer = null;

  const clearCloseTimer = () => {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const closeAll = () => {
    clearCloseTimer();
    items.forEach((item) => {
      item.classList.remove('is-hover');
      const trigger = item.querySelector('.gnb-link');
      const panel = item.querySelector('.gnb-panel');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
    });
    header.classList.remove('is-menu-open');
  };

  const openItem = (item) => {
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

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer = window.setTimeout(closeAll, GNB_CLOSE_DELAY);
  };

  items.forEach((item) => {
    const trigger = item.querySelector('.gnb-link');
    const panel = item.querySelector('.gnb-panel');
    if (!trigger || !panel) return;

    item.addEventListener('mouseenter', () => openItem(item));
    item.addEventListener('mouseleave', scheduleClose);

    trigger.addEventListener('focus', () => openItem(item));

    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAll();
        trigger.focus();
      }
    });

    panel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAll();
        trigger.focus();
      }
    });
  });

  header.addEventListener('focusout', (event) => {
    const nextTarget = event.relatedTarget;
    if (!nextTarget || !header.contains(nextTarget)) {
      scheduleClose();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-menu-open')) {
      const activeItem = header.querySelector('.gnb-item.is-hover');
      const trigger = activeItem?.querySelector('.gnb-link');
      closeAll();
      trigger?.focus();
    }
  });
}

$(document).ready(initGnbMenu);
