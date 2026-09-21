'use strict';

const CONTACT_SECTION_SELECTOR = 'section.contact';
const SCROLL_TRIGGER_SELECTOR = '.scrollToContact';

function getFixedHeaderOffset() {
  const header = document.getElementById('site-header');
  if (!header) return 0;
  return header.getBoundingClientRect().height;
}

function getContactSection(trigger) {
  const targetId = trigger?.dataset?.scrollContact;
  if (targetId) {
    const byId = document.getElementById(targetId);
    if (byId) return byId;
  }

  return document.querySelector(CONTACT_SECTION_SELECTOR);
}

export function scrollToContactSection(trigger) {
  const contact = getContactSection(trigger);
  if (!contact) return false;

  const extraOffset = Number(trigger?.dataset?.scrollContactOffset) || 0;
  const top =
    contact.getBoundingClientRect().top
    + window.scrollY
    - getFixedHeaderOffset()
    - extraOffset;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({
    top: Math.max(0, top),
    left: 0,
    behavior: reduceMotion ? 'auto' : 'smooth',
  });

  return true;
}

function initScrollToContact() {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest(SCROLL_TRIGGER_SELECTOR);
    if (!trigger) return;

    const contact = getContactSection(trigger);
    if (!contact) return;

    event.preventDefault();
    scrollToContactSection(trigger);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollToContact);
} else {
  initScrollToContact();
}
