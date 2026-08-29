'use client';

import { useEffect, useState } from 'react';

/**
 * 読み込み中のスピナー。
 *
 * digipress の CSS ローディングアニメーション（type1）をそのまま使う。
 * 円形のボーダーが回り、中の "Loading..." が逆回転しながら明滅する。
 * 参照: https://digipress.info/tech/css-spinner-animation-demo/
 *
 * 配色だけサイトに合わせて、地は黄（--sun）、スピナーはグレー。
 */
export default function Spinner() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 画像などの外部リソースも含めて読み終わったら消す
    if (document.readyState === 'complete') {
      setLoaded(true);
      return;
    }
    const onLoad = () => setLoaded(true);
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return (
    <div className={loaded ? 'spinner-box loaded' : 'spinner-box'} aria-hidden={loaded}>
      <div className="spinner type1">
        <span>Loading...</span>
      </div>
    </div>
  );
}
