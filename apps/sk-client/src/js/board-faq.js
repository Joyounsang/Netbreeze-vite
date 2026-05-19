'use strict';

function initBoardFaq() {
  const root = document.querySelector('.app-section.board.faq .list-board.dropdown');
  if (!root) return;

  const items = root.querySelectorAll('ul > li');
  const buttons = root.querySelectorAll('.dropdown-btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();

      const item = btn.closest('li');
      if (!item) return;

      const willOpen = !item.classList.contains('is-open');

      items.forEach((li) => li.classList.remove('is-open'));

      if (willOpen) {
        item.classList.add('is-open');
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBoardFaq);
} else {
  initBoardFaq();
}
