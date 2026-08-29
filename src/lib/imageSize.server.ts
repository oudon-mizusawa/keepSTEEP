import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

/**
 * 画像の元サイズを読む。
 *
 * 平面の配置は列ごとに実際のカード高で詰めるので、写真の縦横比が要る。
 * 依存を増やしたくないので、JPEG の SOF マーカーと PNG の IHDR だけ自前で読む。
 * （exhibition の写真は全部 jpg。png も置けるようにはしてある）
 */

/**
 * EXIF の Orientation を読む。無ければ 1。
 *
 * これを見ないと縦横を取り違える。手元の写真にも実際 1 枚あり、ファイル上は
 * 720x425 なのにブラウザは Orientation にしたがって 425x720（縦長）で表示していた。
 * （今は WebP へ変換するときに回転を画素へ焼き込んでいるので該当はない）
 * 縦横比を配置の計算に使っているので、取り違えるとカードが重なる。
 */
function exifOrientation(buf: Buffer, app1Start: number, app1Len: number): number {
  // app1Start は長さフィールドの直後。そこから "Exif\0\0"(6 バイト) があり、TIFF ヘッダが続く
  if (buf.toString('ascii', app1Start, app1Start + 4) !== 'Exif') return 1;
  const tiff = app1Start + 6;
  if (tiff + 8 > app1Start + app1Len) return 1;

  const le = buf.toString('ascii', tiff, tiff + 2) === 'II';
  const u16 = (o: number) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o: number) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));

  const ifd0 = tiff + u32(tiff + 4);
  if (ifd0 + 2 > buf.length) return 1;
  const count = u16(ifd0);

  for (let e = 0; e < count; e++) {
    const entry = ifd0 + 2 + e * 12;
    if (entry + 12 > buf.length) break;
    if (u16(entry) === 0x0112) return u16(entry + 8);
  }
  return 1;
}

function jpegSize(buf: Buffer): { w: number; h: number } | null {
  // SOI(FFD8) の次から、セグメントを順に飛ばして SOF を探す。
  // Orientation は SOF より前の APP1 に入っているので、道すがら拾っておく。
  let i = 2;
  let orientation = 1;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    // スタンドアロンマーカー（長さを持たない）
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    if (marker === 0xe1) orientation = exifOrientation(buf, i + 4, len);
    // SOF0..SOF15。ただし DHT(C4) DAC(CC) RSTn は除く
    const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSOF) {
      const h = buf.readUInt16BE(i + 5);
      const w = buf.readUInt16BE(i + 7);
      // 5〜8 は 90 度回転を含むので、表示される縦横は入れ替わる
      return orientation >= 5 && orientation <= 8 ? { w: h, h: w } : { w, h };
    }
    i += 2 + len;
  }
  return null;
}

/**
 * WebP の表示サイズを読む。
 * RIFF コンテナの中の VP8 / VP8L / VP8X のどれかに寸法が入っている。
 * これを読めないと縦横比が既定値に落ち、平面の積み上げが崩れる。
 */
function webpSize(buf: Buffer): { w: number; h: number } | null {
  if (buf.length < 30) return null;
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return null;
  if (buf.toString('ascii', 8, 12) !== 'WEBP') return null;

  const fourCC = buf.toString('ascii', 12, 16);

  // 拡張形式。キャンバスの寸法が 24bit で -1 されて入っている
  if (fourCC === 'VP8X') {
    const w = buf.readUIntLE(24, 3) + 1;
    const h = buf.readUIntLE(27, 3) + 1;
    return { w, h };
  }

  // 非可逆。0x9d012a のシグネチャの後に 14bit ずつ
  if (fourCC === 'VP8 ') {
    if (buf.readUInt8(23) !== 0x9d || buf.readUInt8(24) !== 0x01 || buf.readUInt8(25) !== 0x2a) {
      return null;
    }
    return {
      w: buf.readUInt16LE(26) & 0x3fff,
      h: buf.readUInt16LE(28) & 0x3fff,
    };
  }

  // 可逆。1bit のシグネチャの後に 14bit ずつ詰めて入っている
  if (fourCC === 'VP8L') {
    if (buf.readUInt8(20) !== 0x2f) return null;
    const bits = buf.readUInt32LE(21);
    return {
      w: (bits & 0x3fff) + 1,
      h: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  return null;
}

function pngSize(buf: Buffer): { w: number; h: number } | null {
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

/** 同じ画像を何度も開かないための覚え書き。ビルド中しか生きない */
const cache = new Map<string, number>();

/**
 * 画像の 高さ÷幅 を返す。読めなければ 0.75（4:3 の横長）を返す。
 * src は "/exhibition/tux.jpg" のような public 配下の絶対パス。
 */
export function imageRatio(src: string | undefined): number {
  const FALLBACK = 0.75;
  if (!src || !src.startsWith('/')) return FALLBACK;

  const hit = cache.get(src);
  if (hit !== undefined) return hit;

  const file = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
  let ratio = FALLBACK;
  try {
    const buf = fs.readFileSync(file);
    const size = /\.webp$/i.test(file)
      ? webpSize(buf)
      : /\.png$/i.test(file)
        ? pngSize(buf)
        : jpegSize(buf);
    if (size && size.w > 0) ratio = size.h / size.w;
  } catch {
    // 画像が無くても平面は出したいので、既定値のまま進む
  }

  cache.set(src, ratio);
  return ratio;
}
