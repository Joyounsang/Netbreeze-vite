'use strict';

const IFRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

function buildYoutubeEmbedSrc(videoId, startSeconds = 0) {
  const params = new URLSearchParams({
    start: String(startSeconds),
    autoplay: '1',
    mute: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function getVideoKey(videoId, startSeconds) {
  return `${videoId}:${startSeconds}`;
}

function isYoutubeReady(iframe) {
  return (
    iframe.dataset.ready === 'true' &&
    iframe.dataset.srcLoaded &&
    iframe.src.includes('youtube.com/embed')
  );
}

function initVideoService() {
  const root = document.querySelector('[data-video-service]');
  if (!root) return;

  const frame = root.querySelector('.video-preview__frame');
  const playersHost = root.querySelector('.video-preview__players');
  const statusEl = root.querySelector('.video-preview__status');
  const links = [...root.querySelectorAll('.video-list__link')];

  if (!frame || !playersHost || !statusEl || !links.length) return;

  const iframeMap = new Map();
  let currentKey = null;
  let activeLink = links[0];

  function setLoading(loading) {
    frame.classList.toggle('is-loading', loading);
    statusEl.hidden = !loading;
  }

  function setVisibleIframe(key) {
    iframeMap.forEach((iframe, mapKey) => {
      iframe.classList.toggle('is-visible', mapKey === key);
    });
  }

  function ensureIframeSrc(iframe, videoId, startSeconds) {
    const src = buildYoutubeEmbedSrc(videoId, startSeconds);

    if (iframe.dataset.srcLoaded === src) {
      return false;
    }

    delete iframe.dataset.ready;
    iframe.src = src;
    iframe.dataset.srcLoaded = src;
    return true;
  }

  function handleIframeLoad(iframe) {
    if (!iframe.dataset.srcLoaded || !iframe.src.includes('youtube.com/embed')) {
      return;
    }

    iframe.dataset.ready = 'true';

    if (iframe.dataset.videoKey !== currentKey) {
      return;
    }

    setVisibleIframe(currentKey);
    setLoading(false);
  }

  function createIframe(link, loadImmediately = false) {
    const videoId = link.dataset.videoId;
    const start = Number(link.dataset.start || 0);
    const key = getVideoKey(videoId, start);

    const iframe = document.createElement('iframe');
    iframe.className = 'video-preview__iframe';
    iframe.title = '서비스 소개 영상';
    iframe.allow = IFRAME_ALLOW;
    iframe.setAttribute('allowfullscreen', '');
    iframe.dataset.videoKey = key;

    iframe.addEventListener('load', () => handleIframeLoad(iframe));

    if (loadImmediately) {
      const src = buildYoutubeEmbedSrc(videoId, start);
      iframe.src = src;
      iframe.dataset.srcLoaded = src;
    }

    iframeMap.set(key, iframe);
    link.dataset.videoKey = key;
    playersHost.appendChild(iframe);

    return { iframe, key, videoId, start };
  }

  const players = links.map((link, index) => createIframe(link, index === 0));

  function preloadIframe({ iframe, videoId, start }) {
    ensureIframeSrc(iframe, videoId, start);
  }

  function showVideo(link) {
    const key = link.dataset.videoKey;
    const iframe = iframeMap.get(key);

    if (!iframe) return;

    currentKey = key;
    activeLink = link;

    links.forEach((item) => {
      item.closest('.video-list__item')?.classList.toggle('is-active', item === link);
    });

    if (isYoutubeReady(iframe)) {
      setVisibleIframe(key);
      setLoading(false);
      return;
    }

    setLoading(true);
    ensureIframeSrc(iframe, link.dataset.videoId, Number(link.dataset.start || 0));
  }

  function preloadRemaining() {
    players.forEach((player) => {
      if (player.key === currentKey) return;
      preloadIframe(player);
    });
  }

  setLoading(true);
  showVideo(activeLink);

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => preloadRemaining(), { timeout: 2000 });
  } else {
    window.setTimeout(preloadRemaining, 800);
  }

  links.forEach((link) => {
    const activate = () => showVideo(link);

    link.addEventListener('mouseenter', activate);
    link.addEventListener('focus', activate);
    link.closest('.video-list__item')?.addEventListener('mouseenter', activate);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVideoService);
} else {
  initVideoService();
}
