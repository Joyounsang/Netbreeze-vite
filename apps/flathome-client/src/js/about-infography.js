'use strict';

/**
 * about 섹션: 4개 .info가 동일 각속도로 궤도를 따라 이동 (공통 회전 오프셋)
 */
function initAboutInfography() {
  const section = document.querySelector('.app-section.about');
  const orbit = section?.querySelector('.graphic .info-orbit');
  if (!section || !orbit) return;

  const items = [...orbit.querySelectorAll('.info')];
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** 시계 방향 각도(12시=0) — 4등분(90°) 균등 배치, 01번 초기: 화면 중앙 부근(8시) */
  const slotCount = items.length;
  const slotStartDeg = 210;
  const slotStepDeg = 360 / slotCount;
  const slotClockDeg = Array.from({ length: slotCount }, (_, index) => {
    return (slotStartDeg - index * slotStepDeg + 360) % 360;
  });
  let rafId = null;

  /** 진입 시 01이 기본 자리, 스크롤 끝에 궤도 전체가 한 바퀴 이동 */
  const startOffset = 0;
  const endOffset = (() => {
    const lastIndex = slotClockDeg.length - 1;
    let offset = slotClockDeg[0] - slotClockDeg[lastIndex];

    while (offset < 0) {
      offset += 360;
    }

    return offset;
  })();

  /** 시계 방향으로 각도 보간 */
  function lerpClockClockwise(from, to, t) {
    let diff = to - from;

    while (diff < 0) {
      diff += 360;
    }

    while (diff >= 360) {
      diff -= 360;
    }

    return from + diff * t;
  }

  function getGlobalOffset(progress) {
    return lerpClockClockwise(startOffset, endOffset, progress);
  }

  function easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
  }

  function getScrollProgress() {
    const rect = section.getBoundingClientRect();
    const scrollRange = section.offsetHeight - window.innerHeight;

    if (scrollRange <= 0) return 0;

    const scrolled = -rect.top;
    return Math.max(0, Math.min(1, scrolled / scrollRange));
  }

  function getOrbitRadius() {
    const styles = getComputedStyle(orbit);
    const cssRadius = parseFloat(styles.getPropertyValue('--orbit-radius'));

    if (Number.isFinite(cssRadius) && cssRadius > 0) {
      return cssRadius;
    }

    const size = Math.min(orbit.offsetWidth, orbit.offsetHeight);
    return size * 0.428;
  }

  /** 12시 기준 시계방향(deg) → info-orbit 중심(0,0) 기준 x,y */
  function clockToXY(clockDeg, radius) {
    const rad = ((clockDeg - 90) * Math.PI) / 180;
    return {
      x: radius * Math.cos(rad),
      y: radius * Math.sin(rad),
    };
  }

  function setItemPosition(item, clockDeg, radius) {
    const { x, y } = clockToXY(clockDeg, radius);
    item.style.setProperty('--info-x', `${x}px`);
    item.style.setProperty('--info-y', `${y}px`);
  }

  /** 화면 중앙에서 멀어질수록 0 (중앙 = 1) */
  function getViewportCenterOpacity(rect) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const itemX = rect.left + rect.width / 2;
    const itemY = rect.top + rect.height / 2;
    const distance = Math.hypot(itemX - centerX, itemY - centerY);
    const viewportMin = Math.min(window.innerWidth, window.innerHeight);
    const fullOpacityRadius = viewportMin * 0.14;
    const fadeOutRadius = viewportMin * 0.4;

    if (distance <= fullOpacityRadius) {
      return 1;
    }

    if (distance >= fadeOutRadius) {
      return 0;
    }

    const t = (distance - fullOpacityRadius) / (fadeOutRadius - fullOpacityRadius);
    return 1 - t;
  }

  function getDistanceToViewportCenter(rect) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const itemX = rect.left + rect.width / 2;
    const itemY = rect.top + rect.height / 2;
    return Math.hypot(itemX - centerX, itemY - centerY);
  }

  function isSectionInView() {
    const rect = section.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  /** 화면 중앙에 가장 가까운 info 1개만 표시 (초기 구간은 01번 고정) */
  function applyViewportOpacityForItems(progress) {
    if (!isSectionInView()) {
      items.forEach((item) => {
        item.style.opacity = '0';
        item.style.pointerEvents = 'none';
      });
      return;
    }

    const nearStart = progress < 0.12;
    let activeIndex = 0;

    if (!nearStart) {
      let closestDistance = Infinity;

      items.forEach((item, index) => {
        const distance = getDistanceToViewportCenter(item.getBoundingClientRect());

        if (distance < closestDistance) {
          closestDistance = distance;
          activeIndex = index;
        }
      });
    }

    items.forEach((item, index) => {
      if (index !== activeIndex) {
        item.style.opacity = '0';
        item.style.pointerEvents = 'none';
        return;
      }

      const opacity = getViewportCenterOpacity(item.getBoundingClientRect());
      item.style.opacity = String(opacity);
      item.style.pointerEvents = opacity < 0.05 ? 'none' : 'auto';
    });
  }

  function updateItemPositions(offset, radius, progress) {
    items.forEach((item, index) => {
      const clock = slotClockDeg[index] + offset;
      setItemPosition(item, clock, radius);
    });

    applyViewportOpacityForItems(progress);
  }

  function update() {
    rafId = null;
    const progress = easeOutCubic(getScrollProgress());
    const radius = getOrbitRadius();
    const offset = getGlobalOffset(progress);

    updateItemPositions(offset, radius, progress);
  }

  function scheduleUpdate() {
    if (!rafId) {
      rafId = requestAnimationFrame(update);
    }
  }

  if (reduceMotion) {
    const radius = getOrbitRadius();
    const offset = startOffset;

    updateItemPositions(offset, radius, 0);
    return;
  }

  update();
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutInfography);
} else {
  initAboutInfography();
}
