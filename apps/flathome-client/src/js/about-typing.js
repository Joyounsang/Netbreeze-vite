'use strict';

/**
 * about 섹션 진입 시 .typing-item 줄 단위 타이핑
 */
function initAboutTyping() {
  const section = document.querySelector('.app-section.about');
  const headline = section?.querySelector('.typing-headline');
  const item = section?.querySelector('.typing-item');
  if (!section || !headline || !item || item.dataset.typingInit) return;

  item.dataset.typingInit = 'true';

  const lines = item.innerHTML
    .split(/<br\s*\/?>/i)
    .map((line) => line.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);

  if (!lines.length) return;

  item.innerHTML = '';
  item.classList.add('is-pending');
  item.setAttribute('aria-hidden', 'true');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const charDelayMs = 52;
  const linePauseMs = 220;

  let hasPlayed = false;
  let timerId = null;

  function render(activeLineIndex, activeCharCount) {
    const parts = lines.map((line, index) => {
      if (index < activeLineIndex) {
        return `<span class="typing-line">${line}</span>`;
      }

      if (index === activeLineIndex) {
        const partial = line.slice(0, activeCharCount);
        const cursor =
          activeCharCount < line.length || activeLineIndex < lines.length - 1
            ? '<span class="typing-cursor" aria-hidden="true"></span>'
            : '';
        return `<span class="typing-line is-active">${partial}${cursor}</span>`;
      }

      return '';
    });

    item.innerHTML = parts.filter(Boolean).join('<br>');
  }

  function finish() {
    timerId = null;
    item.classList.remove('is-pending', 'is-typing');
    item.classList.add('is-done');
    item.removeAttribute('aria-hidden');
    item.innerHTML = lines.map((line) => `<span class="typing-line">${line}</span>`).join('<br>');
    headline.classList.add('is-typing-done');
  }

  function showAll() {
    finish();
  }

  function typeLine(lineIndex, charIndex) {
    render(lineIndex, charIndex);

    const line = lines[lineIndex];

    if (charIndex < line.length) {
      timerId = window.setTimeout(() => typeLine(lineIndex, charIndex + 1), charDelayMs);
      return;
    }

    if (lineIndex < lines.length - 1) {
      timerId = window.setTimeout(() => typeLine(lineIndex + 1, 0), linePauseMs);
      return;
    }

    timerId = window.setTimeout(finish, linePauseMs);
  }

  function play() {
    if (hasPlayed) return;
    hasPlayed = true;

    if (reduceMotion) {
      showAll();
      return;
    }

    item.classList.remove('is-pending');
    item.classList.add('is-typing');
    item.removeAttribute('aria-hidden');
    typeLine(0, 0);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          play();
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
  );

  observer.observe(section);

  item.setAttribute('aria-label', lines.join(' '));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutTyping);
} else {
  initAboutTyping();
}
