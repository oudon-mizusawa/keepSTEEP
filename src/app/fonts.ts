import { Baloo_2, M_PLUS_Rounded_1c, JetBrains_Mono } from 'next/font/google';

/**
 * 3 つの役割で書体を分ける。
 * - display : 屋号 keepSTEEP。太くて丸い欧文
 * - sans    : 見出しと本文の和文。厚みのある丸ゴシック
 * - mono    : センサーの実測値・ナビ・タグ。
 *             等幅にしているのは「機械が出している値」だと字面で示すため
 */
export const display = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '800'],
  variable: '--font-display-src',
  display: 'swap',
});

export const sans = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: ['400', '800'],
  variable: '--font-sans-src',
  display: 'swap',
  // 和文は unicode-range で 120 以上に分割されている。
  // preload を有効にすると next/font が全分割を先読みしてしまい、
  // 実測で 131 ファイル / 1,777KB を落としていた。
  // false にすると、ブラウザが実際に使うグリフの分割だけ取りに行く。
  preload: false,
});

export const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono-src',
  display: 'swap',
});
