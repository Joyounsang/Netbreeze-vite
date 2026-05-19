function initUShapeLayout($simulation) {
  const $list = $simulation.find('.list');
  if (!$list.length) return;

  let rafId = null;

  function updateUShape() {
    if (!$list.length) return;

    const containerWidth = $simulation[0].clientWidth;
    // const maxDepth = 400; // U자 깊이 (픽셀)
    const isMobile = window.innerWidth <= 768;
    const maxDepth = isMobile ? 150 : 400;
    const maxRotation = 45; // 최대 회전 각도
    const items = $list.find('.el-3d');

    if (items.length === 0) {
      rafId = null;
      return;
    }

    items.each(function () {
      const $item = $(this);
      const itemRect = this.getBoundingClientRect();
      const containerRect = $simulation[0].getBoundingClientRect();

      // 아이템의 중심점이 컨테이너 중심점으로부터 얼마나 떨어져 있는지
      const itemCenterX = itemRect.left + itemRect.width / 2;
      const containerCenterX = containerRect.left + containerWidth / 2;
      const distanceFromCenter = itemCenterX - containerCenterX;

      // 정규화된 거리 (-1 ~ 1)
      const normalizedDistance = Math.max(-1, Math.min(1, distanceFromCenter / (containerWidth / 2)));

      // U자 형태 계산
      // 가운데는 0, 양쪽으로 갈수록 깊이가 증가
      const depth = Math.abs(normalizedDistance) * maxDepth;
      const rotation = normalizedDistance * maxRotation;

      // 가운데에 가까울수록 scale이 1에 가까움
      const scale = 1 - Math.abs(normalizedDistance) * 0.4;
      const finalScale = Math.max(scale, 0.7);

      // transform 적용 (가운데는 정방향 유지)
      $item.css({
        transform: `translateY(${depth}px) rotateZ(${rotation}deg) scale(${finalScale})`,
        transformOrigin: 'center center',
        transition: 'transform 0.1s ease-out'
      });
    });

    rafId = null;
  }

  // 스크롤 이벤트로 업데이트
  let scrollTimeout;
  $simulation.on('scroll', function () {
    if (!rafId) {
      rafId = requestAnimationFrame(updateUShape);
    }

    // 스크롤이 멈추면 애니메이션도 멈춤
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }, 150);
  });

  // 초기 업데이트 및 주기적 업데이트
  function startUpdateLoop() {
    if (rafId) return;
    rafId = requestAnimationFrame(function animate() {
      updateUShape();
      if ($list.find('.el-3d').length > 0) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    });
  }

  // 이미지가 로드될 때마다 업데이트 시작
  setTimeout(() => {
    startUpdateLoop();
  }, 500);

  // 새로운 이미지가 추가될 때를 감지
  const observer = new MutationObserver(() => {
    if (!rafId) {
      startUpdateLoop();
    }
  });

  observer.observe($list[0], { childList: true });
}