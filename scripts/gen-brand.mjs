#!/usr/bin/env node
/**
 * Derive the site brand assets from the VR Framework logo.
 *
 * The source (`static/img/vault/VRFrameworkLogo.png`, itself synced from the
 * vault) is white line art on transparency: a drafted "V" with dimension
 * annotations, a solid "R", then the word "Framework". White art is invisible
 * on the light theme, so this script re-inks it:
 *
 *   static/img/vrf-wordmark.png       white, transparent  - dark theme navbar
 *   static/img/vrf-wordmark-ink.png   graphite            - light theme navbar
 *   static/img/vrf-mark.png           white, transparent  - the "VR" lockup
 *   static/img/vrf-mark-ink.png       graphite            - the "VR" lockup
 *   static/img/favicon.png            graphite on paper   - browser tab
 *
 * Only the alpha channel of the source is used, so the ink colour is ours and
 * the drafting texture (soft pencil edges, the gradient in the "R") is kept.
 *
 * Usage: npm run gen:brand
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(SITE_ROOT, 'static', 'img', 'vault', 'VRFrameworkLogo.png');
const OUT_DIR = path.join(SITE_ROOT, 'static', 'img');

/** Brand ink. Keep in sync with `--vrf-ink` in src/css/custom.css. */
const INK = [0x2b, 0x2b, 0x2b];
const WHITE = [0xff, 0xff, 0xff];
const PAPER = [0xf3, 0xf1, 0xec];

// ---------------------------------------------------------------------------
// Minimal PNG reader / writer (8-bit RGBA only - what the logo happens to be)
// ---------------------------------------------------------------------------

function readPng(file) {
  const buf = fs.readFileSync(file);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  if (buf[24] !== 8 || buf[25] !== 6) {
    throw new Error(`${path.basename(file)}: expected 8-bit RGBA (depth 8, colour type 6)`);
  }

  const idat = [];
  for (let off = 8; off < buf.length; ) {
    const len = buf.readUInt32BE(off);
    if (buf.toString('ascii', off + 4, off + 8) === 'IDAT') {
      idat.push(buf.subarray(off + 8, off + 8 + len));
    }
    off += 12 + len;
  }

  // Undo the per-scanline filters (PNG spec 9.2).
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = 4;
  const stride = w * bpp;
  const px = Buffer.alloc(h * stride);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[p++];
    const line = raw.subarray(p, p + stride);
    p += stride;
    const cur = px.subarray(y * stride, (y + 1) * stride);
    const prev = y ? px.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const guess = a + b - c;
        const da = Math.abs(guess - a);
        const db = Math.abs(guess - b);
        const dc = Math.abs(guess - c);
        v += da <= db && da <= dc ? a : db <= dc ? b : c;
      }
      cur[x] = v & 0xff;
    }
  }
  return {w, h, stride, px};
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function writePng(file, w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  const stride = w * 4;
  const raw = Buffer.alloc(h * (stride + 1)); // filter byte 0 (none) per row
  for (let y = 0; y < h; y++) {
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  fs.writeFileSync(
    file,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk('IHDR', ihdr),
      chunk('IDAT', zlib.deflateSync(raw, {level: 9})),
      chunk('IEND', Buffer.alloc(0)),
    ]),
  );
  console.log(`  ${path.relative(SITE_ROOT, file).replace(/\\/g, '/')}  ${w}x${h}`);
}

// ---------------------------------------------------------------------------
// Sampling
// ---------------------------------------------------------------------------

const src = readPng(SOURCE);

/** Shrinks the source rectangle to the pixels that actually carry ink. */
function trim(x0, y0, x1, y1) {
  let minX = x1;
  let minY = y1;
  let maxX = x0;
  let maxY = y0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (src.px[y * src.stride + x * 4 + 3] < 8) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return [minX, minY, maxX + 1, maxY + 1];
}

/** Box-filtered alpha coverage of a source rectangle, resampled to w x h. */
function coverage([x0, y0, x1, y1], w, h) {
  const cov = new Float64Array(w * h);
  for (let ty = 0; ty < h; ty++) {
    const sy0 = y0 + (ty * (y1 - y0)) / h;
    const sy1 = y0 + ((ty + 1) * (y1 - y0)) / h;
    for (let tx = 0; tx < w; tx++) {
      const sx0 = x0 + (tx * (x1 - x0)) / w;
      const sx1 = x0 + ((tx + 1) * (x1 - x0)) / w;
      let sum = 0;
      let n = 0;
      for (let y = Math.floor(sy0); y < Math.max(Math.ceil(sy1), Math.floor(sy0) + 1); y++) {
        for (let x = Math.floor(sx0); x < Math.max(Math.ceil(sx1), Math.floor(sx0) + 1); x++) {
          if (x < 0 || y < 0 || x >= src.w || y >= src.h) continue;
          sum += src.px[y * src.stride + x * 4 + 3];
          n++;
        }
      }
      cov[ty * w + tx] = n ? sum / n / 255 : 0;
    }
  }
  return cov;
}

function inkOnAlpha(cov, [r, g, b]) {
  const out = Buffer.alloc(cov.length * 4);
  for (let i = 0; i < cov.length; i++) {
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    out[i * 4 + 3] = Math.round(cov[i] * 255);
  }
  return out;
}

function inkOnPaper(cov, ink, paper) {
  const out = Buffer.alloc(cov.length * 4);
  for (let i = 0; i < cov.length; i++) {
    const a = cov[i];
    for (let c = 0; c < 3; c++) out[i * 4 + c] = Math.round(paper[c] * (1 - a) + ink[c] * a);
    out[i * 4 + 3] = 255;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

/**
 * Columns of the source artwork. The logo is `[drafted V + solid R] gutter
 * "Framework"`; the gutter is the widest empty column run in the middle.
 */
const MARK = trim(0, 0, 460, src.h); // the "VR" lockup with its dimension lines
const WORDMARK = trim(0, 0, src.w, src.h); // the whole thing

/** Emits a white and a graphite variant at the given pixel height. */
function emitPair(name, rect, height) {
  const width = Math.round(((rect[2] - rect[0]) / (rect[3] - rect[1])) * height);
  const cov = coverage(rect, width, height);
  writePng(path.join(OUT_DIR, `${name}.png`), width, height, inkOnAlpha(cov, WHITE));
  writePng(path.join(OUT_DIR, `${name}-ink.png`), width, height, inkOnAlpha(cov, INK));
}

/** Square graphite-on-paper icon, legible on light and dark browser chrome. */
function emitFavicon(rect, size, pad) {
  const inner = size - pad * 2;
  const scale = Math.min(inner / (rect[2] - rect[0]), inner / (rect[3] - rect[1]));
  const w = Math.round((rect[2] - rect[0]) * scale);
  const h = Math.round((rect[3] - rect[1]) * scale);
  const cov = coverage(rect, w, h);
  const square = new Float64Array(size * size);
  const ox = Math.round((size - w) / 2);
  const oy = Math.round((size - h) / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) square[(y + oy) * size + x + ox] = cov[y * w + x];
  }
  writePng(path.join(OUT_DIR, 'favicon.png'), size, size, inkOnPaper(square, INK, PAPER));
}

console.log(`Source: ${path.relative(SITE_ROOT, SOURCE).replace(/\\/g, '/')} (${src.w}x${src.h})`);
emitPair('vrf-wordmark', WORDMARK, 160);
emitPair('vrf-mark', MARK, 256);
emitFavicon(MARK, 128, 10);
