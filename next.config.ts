import type { NextConfig } from 'next';
import { BASE_PATH } from './src/lib/basePath';

const nextConfig: NextConfig = {
  // Node を常駐させずに配れるよう、静的書き出しにする
  output: 'export',
  /*
   * GitHub Pages のプロジェクトページは
   *   https://oudon-mizusawa.github.io/keepSTEEP/
   * のように «リポジトリ名の下» で配られる。
   * basePath を入れておかないと、/avatar.png のような先頭スラッシュ付きのパスが
   * ドメイン直下を指してしまい、画像も CSS も全部 404 になる。
   * next/image と next/link は basePath を自動で足してくれるので、指定はここだけでよい。
   */
  basePath: BASE_PATH,
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
