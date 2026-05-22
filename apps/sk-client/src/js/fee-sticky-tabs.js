'use strict';

const STICKY_TAB_TOP = 101;
const instances = new Set();
let globalListenersBound = false;

/**
 * tab-stickyContents + 이후 형제 stickyContents[data-target] 스크롤 탭
 */
function getPanelRoot(tabBar) {
  return tabBar.parentElement || tabBar.closest('.app-inner');
}

function getSection(tabBar) {
  return tabBar.closest('[data-sticky-tabs-scope]') || tabBar.closest('.app-section');
}

function collectPanels(panelRoot, tabBar, tabOrder) {
  const targetIds = new Set(tabOrder);
  const found = [];
  let node = tabBar;

  while ((node = node.nextElementSibling)) {
    if (!panelRoot.contains(node)) break;
    if (!node.matches('.stickyContents[data-target]')) continue;
    const id = node.dataset.target;
    if (targetIds.has(id)) found.push(node);
  }

  return tabOrder.map((id) => found.find((panel) => panel.dataset.target === id)).filter(Boolean);
}

function createStickyTabGroup(tabBar) {
  if (!tabBar || tabBar.dataset.stickyTabsInit === 'true') return null;

  const panelRoot = getPanelRoot(tabBar);
  const section = getSection(tabBar);
  if (!panelRoot) return null;

  const tabs = [...tabBar.querySelectorAll('li[data-target]')];
  if (!tabs.length) return null;

  const tabOrder = tabs.map((tab) => tab.dataset.target).filter(Boolean);
  const panels = collectPanels(panelRoot, tabBar, tabOrder);
  if (!panels.length) return null;

  tabBar.dataset.stickyTabsInit = 'true';

  const panelById = new Map(panels.map((panel) => [panel.dataset.target, panel]));
  let isScrollingByClick = false;
  let clickedTargetId = null;
  let scrollEndTimer = null;

  function getStickyLineBottom() {
    return STICKY_TAB_TOP + tabBar.offsetHeight + 1;
  }

  function getActivateLine() {
    const rect = tabBar.getBoundingClientRect();
    const stickyLine = getStickyLineBottom();

    if (rect.top <= STICKY_TAB_TOP + 1) {
      return stickyLine;
    }

    if (rect.top < window.innerHeight && rect.bottom > STICKY_TAB_TOP) {
      return rect.bottom + 1;
    }

    return stickyLine;
  }

  function isGroupInView() {
    const targets = [tabBar, ...panels];
    if (section) targets.push(section);

    return targets.some((el) => {
      const rect = el.getBoundingClientRect();
      return rect.bottom > STICKY_TAB_TOP && rect.top < window.innerHeight;
    });
  }

  function setActiveTab(targetId) {
    tabs.forEach((tab) => {
      tab.classList.toggle('on', tab.dataset.target === targetId);
    });
  }

  function getActivePanelIdByVisibility() {
    const line = getActivateLine();
    let activePanel = panels[0];
    let maxVisible = -1;

    panels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const visibleTop = Math.max(rect.top, line);
      const visibleBottom = Math.min(rect.bottom, window.innerHeight);
      const visible = Math.max(0, visibleBottom - visibleTop);

      if (visible > maxVisible) {
        maxVisible = visible;
        activePanel = panel;
      }
    });

    return activePanel.dataset.target;
  }

  function getActivePanelId() {
    const line = getActivateLine();
    const firstId = panels[0].dataset.target;
    const lastId = panels[panels.length - 1].dataset.target;

    const containing = panels.find((panel) => {
      const { top, bottom } = panel.getBoundingClientRect();
      return top <= line && bottom > line;
    });
    if (containing) return containing.dataset.target;

    if (panels[panels.length - 1].getBoundingClientRect().top <= line) return lastId;
    if (panels[0].getBoundingClientRect().top > line) return firstId;

    return getActivePanelIdByVisibility();
  }

  function updateActiveTab() {
    if (isScrollingByClick || !isGroupInView()) return;
    setActiveTab(getActivePanelId());
  }

  function getPanelScrollTop(panel) {
    const scrollMargin = parseFloat(getComputedStyle(panel).scrollMarginTop) || getStickyLineBottom();
    return window.scrollY + panel.getBoundingClientRect().top - scrollMargin;
  }

  function finishClickScroll() {
    isScrollingByClick = false;
    if (clickedTargetId) {
      setActiveTab(clickedTargetId);
      clickedTargetId = null;
      return;
    }
    updateActiveTab();
  }

  function scrollToPanel(targetId) {
    const panel = panelById.get(targetId);
    if (!panel) return;

    isScrollingByClick = true;
    clickedTargetId = targetId;
    setActiveTab(targetId);

    const top = Math.max(0, getPanelScrollTop(panel));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.clearTimeout(scrollEndTimer);
    if (reduceMotion) {
      window.scrollTo(0, top);
      finishClickScroll();
      return;
    }

    window.scrollTo({ top, behavior: 'smooth' });

    if ('onscrollend' in window) {
      const onScrollEnd = () => {
        window.removeEventListener('scrollend', onScrollEnd);
        window.clearTimeout(scrollEndTimer);
        finishClickScroll();
      };
      window.addEventListener('scrollend', onScrollEnd, { once: true });
    }

    scrollEndTimer = window.setTimeout(finishClickScroll, 900);
  }

  tabs.forEach((tab) => {
    const link = tab.querySelector('a[href]');
    const targetId = tab.dataset.target;
    if (!link || !targetId || !panelById.has(targetId)) return;

    link.addEventListener('click', (event) => {
      event.preventDefault();
      scrollToPanel(targetId);
    });
  });

  updateActiveTab();

  return { updateActiveTab };
}

function bindGlobalListeners() {
  if (globalListenersBound) return;
  globalListenersBound = true;

  let ticking = false;
  const onScrollOrResize = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      instances.forEach((instance) => instance.updateActiveTab());
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
}

function initStickyTabs() {
  document.querySelectorAll('.tab-stickyContents').forEach((tabBar) => {
    const instance = createStickyTabGroup(tabBar);
    if (instance) instances.add(instance);
  });
  bindGlobalListeners();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStickyTabs);
} else {
  initStickyTabs();
}
