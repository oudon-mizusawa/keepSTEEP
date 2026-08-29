import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ラズパイ上で Node を常駐させずに Caddy で配るため、静的書き出しにする
  output: 'export',
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
