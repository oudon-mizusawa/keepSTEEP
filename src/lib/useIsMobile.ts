'use client';

import { useEffect, useState } from 'react';

/**
 * 狭い画面かどうか。CSS の @media (max-width: 640px) と同じ境界で切る。
 *
 * 散らかし配置は座標を JS で持っているので、CSS だけでは直せない。
 * 画面幅が変わったら座標そのものを組み直す必要がある。
 */
const QUERY = '(max-width: 640px)';

export function useIsMobile(): boolean {
  // SSR 時は PC 扱い。マウント後に実際の幅で上書きする
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isMobile;
}
