'use client';

import { useEffect, useState } from 'react';

/**
 * 画面の実寸。散らかし配置は「写真の実際の高さ」で積むので、
 * カード幅を出すために幅が要り、px を vh に直すために高さが要る。
 *
 * 高さは «CSS の 1vh が何 px か» を測る。window.innerHeight ではない。
 * モバイルでスクロールすると URL バーが伸縮して innerHeight が変わるので、
 * それを見ていると
 *   - スクロールのたびに 18 枚ぶんの座標を計算し直して重くなる
 *   - CSS の vh（URL バーでは変わらない）とズレて、物が上下にずれる
 * という二重の問題が出る。実際これがモバイルが重い一番の原因だった。
 *
 * 幅が変わったときだけ組み直す。高さの変化（URL バーの伸縮）では何もしない。
 */
const SSR_FALLBACK = { vw: 1400, vh: 900 };

/** CSS の 100vh が実際に何 px になるかを測る */
function measureVhPx(): number {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;pointer-events:none;visibility:hidden';
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height;
  probe.remove();
  return h || window.innerHeight;
}

export function useViewport(): { vw: number; vh: number } {
  const [size, setSize] = useState(SSR_FALLBACK);

  useEffect(() => {
    const read = () => ({
      // スクロールバーを含まない幅
      vw: document.documentElement.clientWidth,
      vh: measureVhPx(),
    });

    setSize(read());

    const onResize = () => {
      const next = read();
      // 幅が変わっていなければ何もしない。
      // モバイルの URL バー伸縮はここで弾かれる
      setSize((prev) => (prev.vw === next.vw ? prev : next));
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}
