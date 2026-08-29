import type { NextConfig } from 'next';
import { BASE_PATH } from './src/lib/basePath';

const nextConfig: NextConfig = {
  // Node を常駐させずに配れるよう、静的書き出しにする
  output: 'export',
  /*
   * リポジトリ名の下で配るときだけ basePath が要る。
   * 今は root 配信なので空。空文字を渡すと Next に怒られるので、項目ごと出さない。
   */
  ...(BASE_PATH ? { basePath: BASE_PATH } : {}),
  images: {
    // 静的書き出しでは next/image の最適化が使えない。
    // 切り抜き画像は CI 側で sharp を通して事前圧縮する方針。
    unoptimized: true,
  },
  trailingSlash: true,
  // 左下の開発インジケータが HUD に被るので消す
  devIndicators: false,
};

export default nextConfig;
