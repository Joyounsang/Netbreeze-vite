'use strict';

function initBoardDropdown(root) {
  const items = root.querySelectorAll(':scope > ul > li');
  const buttons = root.querySelectorAll(':scope > ul > li > .dropdown-btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();

      const item = btn.closest('li');
      if (!item || !root.contains(item)) return;

      const willOpen = !item.classList.contains('is-open');

      items.forEach((li) => li.classList.remove('is-open'));

      if (willOpen) {
        item.classList.add('is-open');
      }
    });
  });
}

function initBoardFaq() {
  document.querySelectorAll('.list-board.dropdown').forEach(initBoardDropdown);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBoardFaq);
} else {
  initBoardFaq();
}
