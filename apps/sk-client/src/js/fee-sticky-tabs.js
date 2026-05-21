'use strict';

/**
 * tab-stickyContents + stickyContents[data-target] 조합을 범용 스크롤 탭으로 초기화
 */
function initStickyTabGroup(tabBar) {
  if (!tabBar || tabBar.dataset.stickyTabsInit === 'true') return;

  const scope = tabBar.parentElement;
  if (!scope) return;

  const tabs = [...tabBar.querySelectorAll('li[data-target]')];
  if (!tabs.length) return;

  const targetIds = new Set(tabs.map((tab) => tab.dataset.target).filter(Boolean));
  const panels = [...scope.querySelectorAll('.stickyContents[data-target]')].filter((panel) =>
    targetIds.has(panel.dataset.target),
  );

  if (!panels.length) return;

  tabBar.dataset.stickyTabsInit = 'true';

  const panelById = new Map(panels.map((panel) => [panel.dataset.target, panel]));
  let isScrollingByClick = false;
  let clickedTargetId = null;
  let scrollEndTimer = null;
  let ticking = false;

  const STICKY_TAB_TOP = 101;

  function getActivateLine() {
    const rect = tabBar.getBoundingClientRect();
    // sticky 상태(탭이 상단에 고정됐을 때)는 실제 bottom 사용
    if (rect.top <= STICKY_TAB_TOP + 1) {
      return rect.bottom + 1;
    }
    // fee 섹션 밖(하단 버튼 등)에서 호출 시에도 탭 클릭과 동일한 위치로 맞춤
    return STICKY_TAB_TOP + tabBar.offsetHeight + 1;
  }

  function setActiveTab(targetId) {
    tabs.forEach((tab) => {
      tab.classList.toggle('on', tab.dataset.target === targetId);
    });
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

    let closestPanel = panels[0];
    let closestDistance = Infinity;
    panels.forEach((panel) => {
      const distance = Math.abs(panel.getBoundingClientRect().top - line);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPanel = panel;
      }
    });
    return closestPanel.dataset.target;
  }

  function updateActiveTab() {
    if (isScrollingByClick) return;
    setActiveTab(getActivePanelId());
  }

  function getPanelScrollTop(panel) {
    return window.scrollY + panel.getBoundingClientRect().top - getActivateLine();
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

  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateActiveTab();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  updateActiveTab();
}

function initStickyTabs() {
  document.querySelectorAll('.tab-stickyContents').forEach(initStickyTabGroup);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStickyTabs);
} else {
  initStickyTabs();
}
