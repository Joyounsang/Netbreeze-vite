import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stylesRoot = path.join(__dirname, '../src/styles');

function fluidClamp(maxRem) {
  const n = maxRem;
  let min;
  let vw;

  if (n >= 4) {
    min = n * 0.68;
    vw = 5.5;
  } else if (n >= 3) {
    min = n * 0.72;
    vw = 5;
  } else if (n >= 2.2) {
    min = n * 0.78;
    vw = 3.5;
  } else if (n >= 1.8) {
    min = n * 0.85;
    vw = 2.5;
  } else {
    min = n * 0.88;
    if (n >= 1.2) min = Math.max(min, 1.2);
    vw = 2;
  }

  min = Math.min(min, n);
  min = Math.round(min * 100) / 100;
  const mid = Math.round((min + n) * 0.35 * 100) / 100;

  return `clamp(${min}rem, ${vw}vw + ${mid}rem, ${n}rem)`;
}

function transformFontSizeValue(raw) {
  const value = raw.trim().replace(/\s+/g, ' ');

  if (
    !value
    || value.includes('clamp(')
    || value === '0'
    || value === 'inherit'
    || value.startsWith('var(')
    || value.includes('calc(')
  ) {
    return null;
  }

  const remMatch = value.match(/^([\d.]+)rem$/);
  if (remMatch) {
    return fluidClamp(parseFloat(remMatch[1]));
  }

  const pxMatch = value.match(/^([\d.]+)px$/);
  if (pxMatch) {
    return fluidClamp(parseFloat(pxMatch[1]) / 16);
  }

  return null;
}

function transformLine(line) {
  if (/^\s*\/\//.test(line)) return line;

  return line.replace(/font-size:\s*([^;{}]+);/g, (match, sizePart) => {
    const next = transformFontSizeValue(sizePart);
    return next ? `font-size: ${next};` : match;
  });
}

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      if (name === 'lib') continue;
      walk(full, files);
    } else if (name.endsWith('.scss')) {
      files.push(full);
    }
  }
  return files;
}

let changedFiles = 0;
let changedProps = 0;

for (const file of walk(stylesRoot)) {
  const original = fs.readFileSync(file, 'utf8');
  const lines = original.split('\n');
  let fileChanged = false;

  const nextLines = lines.map((line) => {
    const next = transformLine(line);
    if (next !== line) {
      fileChanged = true;
      changedProps += 1;
    }
    return next;
  });

  if (fileChanged) {
    fs.writeFileSync(file, nextLines.join('\n'));
    changedFiles += 1;
  }
}

console.log(`Updated ${changedProps} font-size declarations in ${changedFiles} files.`);
