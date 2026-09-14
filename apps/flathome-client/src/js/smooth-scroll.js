'use strict';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenisInstance = null;

const SCROLL_LOCK_SELECTORS = [
  '.modal.on',
  '.gnb-mobile-nav',
  '.gnb-panel',
  '.scrollbar',
  '[data-lenis-prevent]',
];

function isScrollLocked() {
  return (
    document.documentElement.classList.contains('overflow') ||
    document.body.classList.contains('is-gnb-locked')
  );
}

function shouldPreventNode(node) {
  if (!(node instanceof HTMLElement)) return false;
  return SCROLL_LOCK_SELECTORS.some((selector) => node.closest(selector));
}

export function getLenis() {
  return lenisInstance;
}

export function scrollTo(target, options = {}) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, options);
    return;
  }

  const top = typeof target === 'number' ? target : 0;
  window.scrollTo({ top, behavior: options.immediate ? 'auto' : 'smooth' });
}

function syncScrollLock() {
  if (!lenisInstance) return;

  if (isScrollLocked()) lenisInstance.stop();
  else lenisInstance.start();
}

export function initSmoothScroll() {
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    autoRaf: true,
    lerp: 0.085,
    duration: 1.15,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.1,
    syncTouch: true,
    smoothWheel: true,
    anchors: true,
    prevent: shouldPreventNode,
  });

  document.documentElement.classList.add('lenis', 'lenis-smooth');

  lenisInstance.on('scroll', () => {
    window.dispatchEvent(new Event('scroll'));
  });

  const observer = new MutationObserver(syncScrollLock);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  syncScrollLock();
  scrollToInitialHash();

  return lenisInstance;
}

const ANCHOR_SCROLL_OFFSET = -100;

function scrollToInitialHash() {
  const { hash } = window.location;
  if (!hash || hash.length < 2) return;

  const target = document.querySelector(hash);
  if (!target) return;

  window.setTimeout(() => {
    scrollTo(target, { offset: ANCHOR_SCROLL_OFFSET });
  }, 150);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSmoothScroll);
} else {
  initSmoothScroll();
}
