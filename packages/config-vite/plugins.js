import { getVersionDate } from './utils.js';

// 빌드된 index.html 내 js/css 경로에 ?ver=YYMMDD 쿼리를 추가하는 플러그인
export function appendVersionQuery(html, appPath) {
  const version = getVersionDate();

  const escapedPrefix = `/${appPath}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const assetPattern = new RegExp(
    `(href|src)=([\"'])(${escapedPrefix}[^\"'?#]+\\.(?:css|js))(\\2)`,
    'g'
  );

  return html.replace(assetPattern, (_match, attr, quote, url) => {
    // 이미 query/hash 있으면 패스
    if (/[?#]/.test(url)) return `${attr}=${quote}${url}${quote}`;

    return `${attr}=${quote}${url}?ver=${version}${quote}`;
  });
}

// HTML 파일의 이미지 경로를 자동으로 변환하는 플러그인
export function injectCampaignImagePath(html) {
  return html.replace(/src="\/images\//g, 'src="assets/images/');
}

export function createCampaignHtmlTransform(mode, appPath) {
  function transformHtml(html) {
    // 1) HTML 이미지 경로 변환
    const withImages = injectCampaignImagePath(html);

    // 2) js/css에 ?ver=YYMMDD 붙이고 싶으면 이 줄 활성화
    // return appendVersionQuery(withImages, appPath);

    // 버전쿼리 안 쓴다면 그냥 이거 리턴
    return withImages;
  }

  return {
    name: 'campaign-html-transform',
    transformIndexHtml(html) {
      if (mode !== 'production') return html;
      return transformHtml(html);
    },
  };
}

// CSS 내의 이미지 경로를 상대 경로로 변환하는 플러그인
// 빌드 환경: assets/css/style.css에서 assets/images/로 가려면 ../images/가 되어야 함
// 개발 환경: public/images/가 /images/로 서빙되므로 /images/로 변환
export function createCampaignCssUrlPrefixer(appPath) {
  let isDev = false;

  return {
    name: 'campaign-css-url-prefixer',
    configResolved(config) {
      isDev = config.command === 'serve';
    },
    transform(code, id) {
      // 개발 환경에서 SCSS/CSS 파일의 이미지 경로 변환
      if (isDev && (id.endsWith('.scss') || id.endsWith('.css'))) {
        const CSS_IMAGE_URL_PATTERN = /url\((['\"]?)(?!data:|https?:|\/)(?:\.\.\/)*images\/([^'\")?#]+(?:[?#][^'\")]+)?)\1\)/g;

        return code.replace(
          CSS_IMAGE_URL_PATTERN,
          (_match, quote = '', rest) => {
            // 개발 환경: public/assets/images/가 /assets/images/로 서빙되므로 절대 경로 사용
            return `url(${quote}/assets/images/${rest}${quote})`;
          }
        );
      }
      return null;
    },
    generateBundle(_options, bundle) {
      // 빌드 환경: CSS 파일 내의 이미지 경로를 상대 경로로 변환
      const CSS_IMAGE_URL_PATTERN = /url\((['\"]?)(?!data:|https?:|\/)(?:\.\.\/)*images\/([^'\")?#]+(?:[?#][^'\")]+)?)\1\)/g;
      const cssMatcher = new RegExp(CSS_IMAGE_URL_PATTERN.source, CSS_IMAGE_URL_PATTERN.flags);

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (!fileName.endsWith('.css') || chunk.type !== 'asset') continue;

        cssMatcher.lastIndex = 0;
        // CSS 파일이 assets/css/에 있으므로, images는 ../images/로 상대 경로 사용
        chunk.source = String(chunk.source).replace(
          cssMatcher,
          (_match, quote = '', rest) => {
            // 이미 ../images/로 되어 있으면 그대로 유지
            if (_match.includes('../images/')) {
              return _match;
            }
            // ../images/ 또는 images/ 패턴을 ../images/로 통일
            return `url(${quote}../images/${rest}${quote})`;
          }
        );
      }
    },
  };
}
