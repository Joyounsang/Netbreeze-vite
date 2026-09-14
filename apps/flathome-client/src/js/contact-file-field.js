'use strict';

const EMPTY_FILE_LABEL = '선택된 파일 없음';

function initFileField(root) {
  const fileInput = root.querySelector('input[type="file"]');
  const nameInput = root.querySelector('[data-file-name]');
  if (!fileInput || !nameInput || root.dataset.fileFieldInit) return;

  root.dataset.fileFieldInit = 'true';

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    nameInput.value = file ? file.name : '';
    nameInput.placeholder = EMPTY_FILE_LABEL;
  });
}

function initContactFileFields() {
  document.querySelectorAll('[data-file-field]').forEach(initFileField);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactFileFields);
} else {
  initContactFileFields();
}
