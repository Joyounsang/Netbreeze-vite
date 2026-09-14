'use strict';

function initMultiSelect(root) {
  const select = root.querySelector('select[multiple]');
  if (!select || root.dataset.multiSelectInit) return;

  root.dataset.multiSelectInit = 'true';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'multi-select__trigger';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-controls', `${select.id}-panel`);

  const valueEl = document.createElement('span');
  valueEl.className = 'multi-select__value';
  trigger.appendChild(valueEl);

  const panel = document.createElement('div');
  panel.className = 'multi-select__panel';
  panel.id = `${select.id}-panel`;
  panel.hidden = true;

  const list = document.createElement('ul');
  list.className = 'multi-select__list';
  list.setAttribute('role', 'listbox');
  panel.appendChild(list);

  const options = Array.from(select.options);

  options.forEach((option) => {
    const li = document.createElement('li');
    const label = document.createElement('label');
    label.className = 'checkbox min';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = option.value;
    input.checked = option.selected;

    const span = document.createElement('span');
    span.textContent = option.textContent.trim();

    label.appendChild(input);
    label.appendChild(span);
    li.appendChild(label);
    list.appendChild(li);

    input.addEventListener('change', () => {
      option.selected = input.checked;
      updateDisplay();
    });
  });

  const updateDisplay = () => {
    const selected = options.filter((option) => option.selected);

    if (!selected.length) {
      valueEl.textContent = select.dataset.placeholder || '선택해주세요';
      valueEl.classList.add('is-placeholder');
      return;
    }

    valueEl.textContent = selected.map((option) => option.textContent.trim()).join(', ');
    valueEl.classList.remove('is-placeholder');
  };

  const close = () => {
    root.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  };

  const open = () => {
    root.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
  };

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (root.classList.contains('is-open')) {
      close();
      return;
    }

    open();
  });

  panel.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  document.addEventListener('click', () => {
    close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  select.classList.add('multi-select__native');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  root.insertBefore(trigger, select);
  root.appendChild(panel);
  updateDisplay();
}

function initContactServiceSelect() {
  document.querySelectorAll('[data-multi-select]').forEach(initMultiSelect);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactServiceSelect);
} else {
  initContactServiceSelect();
}
