'use strict';

function getCards($simulation) {
  return $simulation.find('.list > .service-card');
}

function getCardCount($simulation) {
  return getCards($simulation).length;
}

function getScrollMetrics($simulation) {
  const el = $simulation[0];
  return {
    el,
    scrollLeft: el.scrollLeft,
    center: el.scrollLeft + el.clientWidth / 2,
    containerWidth: el.clientWidth,
  };
}

function getCardScrollLeft($simulation, index) {
  const $card = getCards($simulation).eq(index);
  if (!$card.length) return null;

  const cardLeft = $card[0].offsetLeft;
  const cardWidth = $card.outerWidth();
  const { containerWidth, el } = getScrollMetrics($simulation);
  const maxScroll = el.scrollWidth - containerWidth;
  return Math.max(0, Math.min(maxScroll, cardLeft - (containerWidth - cardWidth) / 2));
}

function getClosestCardIndex($simulation) {
  const $cards = getCards($simulation);
  if (!$cards.length) return 0;

  const { center } = getScrollMetrics($simulation);
  let closestIndex = 0;
  let closestDistance = Infinity;

  $cards.each(function (i) {
    const cardCenter = this.offsetLeft + this.offsetWidth / 2;
    const distance = Math.abs(cardCenter - center);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = i;
    }
  });

  return closestIndex;
}

function createScrollAnimator($simulation) {
  const el = $simulation[0];
  let rafId = null;

  function setScrollingState(active) {
    $simulation.toggleClass('is-scrolling', active);
  }

  function cancel() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    setScrollingState(false);
  }

  function scrollTo(targetLeft, options, onComplete) {
    const duration = options?.duration ?? 520;
    const ease = options?.ease ?? 'outCubic';

    cancel();

    const startLeft = el.scrollLeft;
    const distance = targetLeft - startLeft;

    if (duration <= 0 || Math.abs(distance) < 1) {
      el.scrollLeft = targetLeft;
      onComplete?.();
      return;
    }

    const startTime = performance.now();
    setScrollingState(true);

    const easing = {
      outCubic: (t) => 1 - (1 - t) ** 3,
      outQuart: (t) => 1 - (1 - t) ** 4,
    };
    const easeFn = easing[ease] || easing.outCubic;

    function tick(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      el.scrollLeft = startLeft + distance * easeFn(progress);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      rafId = null;
      el.scrollLeft = targetLeft;
      setScrollingState(false);
      onComplete?.();
    }

    rafId = requestAnimationFrame(tick);
  }

  return { scrollTo, cancel, setScrollingState };
}

function removeServiceCardClones($simulation) {
  $simulation.find('.service-card--clone').remove();
  $simulation.removeData('serviceLoop');
}

function isCoarsePointerDevice() {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function snapToNearestCard($el, animator, autoScroll) {
  animator.cancel();
  animator.setScrollingState(false);

  const index = getClosestCardIndex($el);
  const targetLeft = getCardScrollLeft($el, index);
  if (targetLeft === null) return;

  animator.scrollTo(targetLeft, { duration: 380, ease: 'outQuart' }, () => {
    $el.trigger('scrollend.serviceCards');
    autoScroll?.syncFromScroll();
    autoScroll?.resumeLater();
  });
}

/** 모바일 네이티브 터치 스크롤 후 가장 가까운 카드로 스냅 */
function enableNativeScrollSnap($el, autoScroll, animator) {
  if (!isCoarsePointerDevice()) {
    return;
  }

  let idleTimer = null;

  function onScrollEnd() {
    if ($el.hasClass('dragging') || $el.hasClass('is-scrolling')) return;
    snapToNearestCard($el, animator, autoScroll);
  }

  function scheduleIdleSnap() {
    if (idleTimer) {
      clearTimeout(idleTimer);
    }

    idleTimer = window.setTimeout(() => {
      idleTimer = null;
      onScrollEnd();
    }, 140);
  }

  $el[0].addEventListener(
    'scrollend',
    () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
      onScrollEnd();
    },
    { passive: true },
  );

  $el.on('scroll.serviceCardsSnap', scheduleIdleSnap);
}

/** PC 마우스 드래그만 커스텀 처리 (모바일은 네이티브 터치 스크롤) */
function enableDragScroll($el, autoScroll, animator) {
  if (isCoarsePointerDevice()) {
    return;
  }

  $el.css('pointer-events', 'auto');

  let isDragging = false;
  let scrollLeft = 0;
  let lastMoveTime = 0;
  let lastMoveX = 0;
  let velocityX = 0;
  let animationFrameId = null;

  let pointerStartX = 0;
  let pointerStartY = 0;
  let hasDragged = false;
  let suppressClick = false;

  const friction = 0.94;
  const minVelocity = 0.45;
  const velocityMultiplier = 18;
  const dragThreshold = 8;
  const clickSuppressMs = 300;

  function finishInteraction() {
    snapToNearestCard($el, animator, autoScroll);
  }

  function markDragIfMoved(pageX, pageY) {
    if (hasDragged) return;

    const dx = Math.abs(pageX - pointerStartX);
    const dy = Math.abs(pageY - pointerStartY);

    if (dx > dragThreshold || dy > dragThreshold) {
      hasDragged = true;
    }
  }

  function suppressLinkClick() {
    suppressClick = true;
    window.setTimeout(() => {
      suppressClick = false;
    }, clickSuppressMs);
  }

  function start(e) {
    if (e.button !== 0) return;

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    animator.cancel();
    autoScroll?.pause();

    isDragging = true;
    hasDragged = false;
    suppressClick = false;
    pointerStartX = e.pageX;
    pointerStartY = e.pageY;
    scrollLeft = $el.scrollLeft();
    $el.addClass('dragging');
    animator.setScrollingState(true);
    lastMoveTime = Date.now();
    lastMoveX = e.pageX;
    velocityX = 0;
    e.preventDefault();
  }

  function move(e) {
    if (!isDragging) return;

    e.preventDefault();
    markDragIfMoved(e.pageX, e.pageY);

    const currentTime = Date.now();
    const deltaTime = currentTime - lastMoveTime;

    if (deltaTime > 0) {
      velocityX = (e.pageX - lastMoveX) / deltaTime;
    }

    const walkX = e.pageX - pointerStartX;
    $el.scrollLeft(scrollLeft - walkX);

    lastMoveTime = currentTime;
    lastMoveX = e.pageX;
  }

  function end() {
    isDragging = false;
    $el.removeClass('dragging');

    if (hasDragged) {
      suppressLinkClick();
    }

    if (Math.abs(velocityX) > minVelocity) {
      animateInertia();
    } else {
      finishInteraction();
    }

    hasDragged = false;
    $el.trigger('scroll.serviceCards');
  }

  function animateInertia() {
    const maxScrollLeft = $el[0].scrollWidth - $el[0].clientWidth;
    const currentScrollLeft = $el.scrollLeft();

    if (Math.abs(velocityX) < minVelocity) {
      animationFrameId = null;
      finishInteraction();
      return;
    }

    const atLeftEdge = currentScrollLeft <= 0 && velocityX < 0;
    const atRightEdge = currentScrollLeft >= maxScrollLeft && velocityX > 0;

    if (atLeftEdge || atRightEdge) {
      velocityX = 0;
      animationFrameId = null;
      finishInteraction();
      return;
    }

    const newScrollLeft = Math.max(0, Math.min(maxScrollLeft, currentScrollLeft - velocityX * velocityMultiplier));
    $el.scrollLeft(newScrollLeft);
    velocityX *= friction;
    animationFrameId = requestAnimationFrame(animateInertia);
  }

  $el.on('mousedown', start);
  $(document).on('mousemove.serviceDrag', move);
  $(document).on('mouseup.serviceDrag', end);

  $el[0].addEventListener(
    'click',
    (e) => {
      const link = e.target.closest('a.card-item');
      if (!link || !$el[0].contains(link)) return;

      if (suppressClick || $el.hasClass('dragging')) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true,
  );
}

function enableAutoScroll($el, animator, layoutApi) {
  let stepTimer = null;
  let resumeTimer = null;
  let isPaused = true;
  let isHovered = false;
  let currentIndex = 0;
  let direction = 1;
  let isStepping = false;

  const stepPauseMs = 2400;
  const scrollDuration = 520;

  function syncFromScroll() {
    currentIndex = getClosestCardIndex($el);
  }

  function scheduleNextStep() {
    if (stepTimer) {
      clearTimeout(stepTimer);
    }

    stepTimer = window.setTimeout(() => {
      stepTimer = null;
      if (isPaused || isHovered || $el.hasClass('dragging') || isStepping) return;
      stepCard();
    }, stepPauseMs);
  }

  function scrollToIndex(index) {
    const count = getCardCount($el);
    if (!count) return;

    const targetIndex = Math.max(0, Math.min(count - 1, index));
    const targetLeft = getCardScrollLeft($el, targetIndex);
    if (targetLeft === null) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 0 : scrollDuration;

    currentIndex = targetIndex;
    isStepping = true;

    animator.scrollTo(targetLeft, { duration, ease: 'outCubic' }, () => {
      isStepping = false;
      syncFromScroll();
      layoutApi.setActiveByIndex(currentIndex, true);
      $el.trigger('scrollend.serviceCards');
      scheduleNextStep();
    });
  }

  function stepCard() {
    const count = getCardCount($el);
    if (count <= 1 || isStepping) return;

    syncFromScroll();

    if (currentIndex >= count - 1) {
      direction = -1;
    } else if (currentIndex <= 0) {
      direction = 1;
    }

    scrollToIndex(currentIndex + direction);
  }

  function pause() {
    isPaused = true;
    isStepping = false;

    if (stepTimer) {
      clearTimeout(stepTimer);
      stepTimer = null;
    }

    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }

    animator.cancel();
  }

  function resumeLater() {
    if (isHovered) return;

    if (resumeTimer) {
      clearTimeout(resumeTimer);
    }

    resumeTimer = window.setTimeout(() => {
      resumeTimer = null;

      if (isHovered || $el.hasClass('dragging') || $el.hasClass('is-scrolling') || isStepping) return;

      start();
    }, 1600);
  }

  function setHovered(hovered) {
    isHovered = hovered;

    if (hovered) {
      pause();
      return;
    }

    if ($el.hasClass('dragging') || $el.hasClass('is-scrolling') || isStepping) return;

    resumeLater();
  }

  function start() {
    if (isHovered || $el.hasClass('dragging') || $el.hasClass('is-scrolling') || isStepping) return;

    if ($el[0].scrollWidth - $el[0].clientWidth <= 0) return;

    isPaused = false;
    syncFromScroll();
    scheduleNextStep();
  }

  return {
    pause,
    resumeLater,
    start,
    setHovered,
    syncFromScroll,
    destroy() {
      pause();
    },
  };
}

function initServiceCardLayout($simulation) {
  if (!getCardCount($simulation)) return;

  let scrollRafId = null;
  let activeCardEl = null;
  let activeIndex = -1;

  function updateTransforms() {
    const $cards = getCards($simulation);
    if (!$cards.length) {
      scrollRafId = null;
      return;
    }

    const { center, containerWidth } = getScrollMetrics($simulation);
    const isMobile = window.innerWidth <= 768;
    const maxDepth = isMobile ? 32 : 64;
    const halfWidth = containerWidth / 2;

    $cards.each(function () {
      const cardCenter = this.offsetLeft + this.offsetWidth / 2;
      const distanceFromCenter = cardCenter - center;
      const normalizedDistance = Math.max(-1, Math.min(1, distanceFromCenter / halfWidth));
      const depth = Math.abs(normalizedDistance) * maxDepth;
      const scale = 1 - Math.abs(normalizedDistance) * 0.05;
      const finalScale = Math.max(scale, 0.94);

      this.style.setProperty('--card-depth', `${depth}px`);
      this.style.setProperty('--card-scale', String(finalScale));
    });

    scrollRafId = null;
  }

  function setActiveByIndex(index, force) {
    const $cards = getCards($simulation);
    if (!$cards.length) return;

    if (!force && index === activeIndex) return;

    activeIndex = index;
    const nextActive = $cards[index];

    if (activeCardEl) {
      activeCardEl.classList.remove('is-active');
    }

    activeCardEl = nextActive || null;

    if (activeCardEl) {
      activeCardEl.classList.add('is-active');
    }
  }

  function updateActiveCard() {
    setActiveByIndex(getClosestCardIndex($simulation), false);
  }

  function scheduleTransformUpdate() {
    if ($simulation.hasClass('dragging')) {
      return;
    }

    if (!scrollRafId) {
      scrollRafId = requestAnimationFrame(updateTransforms);
    }
  }

  function handleScrollEnd() {
    updateTransforms();
    updateActiveCard();
  }

  $simulation.on('scroll.serviceCards', scheduleTransformUpdate);
  $simulation.on('scrollend.serviceCards', handleScrollEnd);
  $(window).on('resize.serviceCards', () => {
    updateTransforms();
    updateActiveCard();
  });

  updateTransforms();
  updateActiveCard();

  return { setActiveByIndex, updateActiveCard, updateTransforms };
}

function initServiceCardTrack() {
  const $track = $('.service-card-track .simulation');
  if (!$track.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $track.each(function () {
    const $simulation = $(this);

    removeServiceCardClones($simulation);

    const animator = createScrollAnimator($simulation);
    const layoutApi = initServiceCardLayout($simulation);
    const autoScroll = enableAutoScroll($simulation, animator, layoutApi);

    enableNativeScrollSnap($simulation, autoScroll, animator);
    enableDragScroll($simulation, autoScroll, animator);

    const $hoverTarget = $simulation.closest('.service-card-track');
    if ($hoverTarget.length) {
      $hoverTarget.on('mouseenter.serviceCards', () => autoScroll.setHovered(true));
      $hoverTarget.on('mouseleave.serviceCards', () => autoScroll.setHovered(false));
    }

    const initialIndex = Math.min(2, getCardCount($simulation) - 1);
    const initialLeft = getCardScrollLeft($simulation, initialIndex);
    if (initialLeft !== null) {
      $simulation[0].scrollLeft = initialLeft;
    }
    layoutApi.setActiveByIndex(initialIndex, true);
    layoutApi.updateTransforms();
    $simulation.trigger('scrollend.serviceCards');

    if (prefersReducedMotion) return;

    const simulationEl = this;

    const tryStartAuto = () => {
      if (simulationEl.scrollWidth - simulationEl.clientWidth > 0) {
        autoScroll.start();
        return true;
      }
      return false;
    };

    const $section = $simulation.closest('.service-card-track');

    if ($section.length && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              tryStartAuto();
            } else {
              autoScroll.pause();
            }
          });
        },
        { threshold: 0.15 },
      );
      observer.observe($section[0]);
    } else {
      tryStartAuto();
      window.setTimeout(tryStartAuto, 300);
    }

    $(window).on('load.serviceCards', tryStartAuto);
  });
}

function bootServiceCardTrack() {
  initServiceCardTrack();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootServiceCardTrack);
} else {
  bootServiceCardTrack();
}
