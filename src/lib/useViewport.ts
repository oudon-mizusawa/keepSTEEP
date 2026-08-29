'use client';

import { useEffect, useState } from 'react';

/**
 * 画面の実寸。散らかし配置は「写真の実際の高さ」で積むので、
 * カード幅を出すために幅と高さの両方が要る。
 *
 * SSR では window が無いので、まず代表的な PC サイズで組んでおき、
 * マウント後に実寸で組み直す（初回の HTML が極端に崩れないようにするため）。
 */
const SSR_FALLBACK = { vw: 1400, vh: 900 };

export function useViewport(): { vw: number; vh: number } {
  const [size, setSize] = useState(SSR_FALLBACK);

  useEffect(() => {
    const update = () => setSize({ vw: window.innerWidth, vh: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
}
