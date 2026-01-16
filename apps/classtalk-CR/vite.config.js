// apps/XXX/vite.config.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineCampaignConfig } from '@repo/config-vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// src 폴더를 제외한 모든 HTML 파일 수집
function getAllHtmlFiles(rootDir) {
  const htmlFiles = [];

  function walk(dir) {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const fullPath = path.join(dir, dirent.name);

      // dist, node_modules 무시
      if (dirent.name === 'dist' || dirent.name === 'node_modules') continue;

      // src 폴더 전체 무시
      if (fullPath.includes(`${path.sep}src${path.sep}`)) continue;

      // 폴더면 재귀 탐색
      if (dirent.isDirectory()) {
        walk(fullPath);
        continue;
      }

      // HTML 파일이면 수집
      if (dirent.isFile() && dirent.name.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return htmlFiles;
}

// include 태그를 처리하는 함수
function processIncludes(content, baseDir) {
  const includePattern = /<include\s+src=["']([^"']+)["']\s*><\/include>/gi;

  return content.replace(includePattern, (match, includePath) => {
    const fullPath = path.join(baseDir, includePath);

    if (fs.existsSync(fullPath)) {
      let includedContent = fs.readFileSync(fullPath, 'utf-8');
      // 중첩된 include도 처리 (재귀)
      includedContent = processIncludes(includedContent, baseDir);
      return includedContent;
    } else {
      console.warn(`Include 파일을 찾을 수 없습니다: ${fullPath}`);
      return match; // 원본 유지
    }
  });
}

// lib 파일을 복사하고 HTML 경로를 변환하는 플러그인
function copyLibFilesAndTransformHtml() {
  let outDir = '';
  let projectRoot = '';
  let isDev = false;

  // 디렉토리 복사 함수
  function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;

    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  return {
    name: 'copy-lib-files-and-transform-html',
    configResolved(config) {
      outDir = path.resolve(config.build.outDir);
      projectRoot = config.root || process.cwd();
      isDev = config.command === 'serve';
    },
    transformIndexHtml(html) {
      // 개발 환경: lib 파일 경로를 개발 경로로 변환
      if (isDev) {
        return html
          .replace(/src=["']assets\/js\/lib\/([^"']+)["']/g, 'src="/src/js/lib/$1"')
          .replace(/href=["']assets\/css\/lib\/([^"']+)["']/g, 'href="/src/styles/lib/$1"');
      }
      // 빌드 환경: 개발 경로를 빌드 경로로 변환
      return html
        .replace(/src=["']\/src\/js\/lib\/([^"']+)["']/g, 'src="assets/js/lib/$1"')
        .replace(/href=["']\/src\/styles\/lib\/([^"']+)["']/g, 'href="assets/css/lib/$1"');
    },
    closeBundle() {
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      // lib 파일 복사
      const jsLibSrc = path.join(projectRoot, 'src/js/lib');
      const jsLibDest = path.join(outDir, 'assets/js/lib');
      const cssLibSrc = path.join(projectRoot, 'src/styles/lib');
      const cssLibDest = path.join(outDir, 'assets/css/lib');

      if (fs.existsSync(jsLibSrc)) {
        copyDir(jsLibSrc, jsLibDest);
        console.log(`✅ lib JS 파일 복사: ${jsLibSrc} -> ${jsLibDest}`);
      }

      if (fs.existsSync(cssLibSrc)) {
        copyDir(cssLibSrc, cssLibDest);
        console.log(`✅ lib CSS 파일 복사: ${cssLibSrc} -> ${cssLibDest}`);
      }

      // src 폴더를 제외한 모든 HTML 파일 복사
      const htmlFiles = getAllHtmlFiles(projectRoot);

      htmlFiles.forEach(filePath => {
        const fileName = path.basename(filePath);
        const destPath = path.join(outDir, fileName);

        // HTML 파일 읽기
        let content = fs.readFileSync(filePath, 'utf-8');

        // include 태그 처리
        content = processIncludes(content, projectRoot);

        // 개발 경로를 빌드 경로로 변환
        content = content
          .replace(/href=["']\/src\/styles\/style\.scss["']/g, 'href="assets/css/style.css"')
          .replace(/<script\s+type=["']module["']\s+src=["']\/src\/js\/main\.js["']><\/script>/g, '<script src="assets/js/scripts.js"></script>')
          // lib 파일 경로 변환
          .replace(/src=["']\/src\/js\/lib\/([^"']+)["']/g, 'src="assets/js/lib/$1"')
          .replace(/href=["']\/src\/styles\/lib\/([^"']+)["']/g, 'href="assets/css/lib/$1"')
          // 기존 빌드 경로도 유지 (혹시 모를 경우 대비)
          .replace(/href=["']assets\/css\/style\.css["']/g, 'href="assets/css/style.css"')
          .replace(/src=["']assets\/js\/scripts\.js["']/g, 'src="assets/js/scripts.js"');

        // 경로 업데이트: /js/, /css/, /images/, /fonts/ -> /app/assets/js/, /app/assets/css/, /app/assets/images/, /app/assets/fonts/
        const basePath = 'app';
        content = content.replace(
          /(href|src)=(["'])\/(?!app\/assets\/)(js|css|images|fonts)\//g,
          `$1=$2/${basePath}/assets/$3/`
        );

        fs.writeFileSync(destPath, content, 'utf-8');
        console.log(`복사 및 경로 업데이트됨: ${fileName} -> ${destPath}`);
      });
    },
  };
}

const appPath = 'app';
const projectRoot = __dirname;

export default defineCampaignConfig({
  appPath,
  projectRoot,
  server: {
    open: '/index.html', // 개발 서버 시작 시 index.html 열기
  },
  build: {
    // CSS와 JS 파일 minify 비활성화
    minify: false,
    cssMinify: false,
    rollupOptions: {
      // index.html만 엔트리 포인트로 사용 (모든 HTML이 같은 scripts.js를 공유)
      input: path.join(projectRoot, 'index.html'),
      output: {
        // 모든 엔트리를 scripts.js 하나로 통합
        entryFileNames: 'assets/js/scripts.js',
        chunkFileNames: 'assets/js/[name].js',
      },
    },
  },
  plugins: [copyLibFilesAndTransformHtml()],
});
