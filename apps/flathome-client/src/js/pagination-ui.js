'use strict';

/** 샘플 페이지네이션: href="#" 점프 방지 (실제 페이징 연동 전) */
function initPaginationUi() {
  document.querySelectorAll('.app-pagination a[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPaginationUi);
} else {
  initPaginationUi();
}
