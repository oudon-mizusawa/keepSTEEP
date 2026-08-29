'use client';

import { useEffect, useRef } from 'react';

/**
 * マウスが通った道に四角を落とす。四角は回りながら縮んで消える。
 * タッチ端末には軌跡が無いので、代わりにタップした場所で四角が弾ける。
 *
 * 触れるものの上に乗るが、pointer-events: none なので
 * 物を摘まむ・ナビを押すといった操作は一切邪魔しない。
 */

/** 何 ms ごとに 1 枚落とすか。これ以上細かくすると数が増えるだけで見た目は変わらない */
const DROP_INTERVAL_MS = 28;
/** 1 枚が消えるまで */
const TILE_LIFE_MS = 620;
/** 弾ける四角の数と飛距離 */
const BURST_COUNT = 10;
const BURST_LIFE_MS = 520;
/** 同時に存在してよい枚数の上限。ウィンドウを高速で撫で回されても増え続けないように */
const MAX_LIVE = 90;

export default function CursorTrail() {
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 動きを減らす設定の人には出さない
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layer = layerRef.current;
    if (!layer) return;

    let live = 0;
    let lastDrop = 0;

    const add = (css: string, keyframes: Keyframe[], duration: number) => {
      if (live >= MAX_LIVE) return;
      const el = document.createElement('span');
      el.className = 'trail__bit';
      el.style.cssText = css;
      layer.appendChild(el);
      live++;
      const anim = el.animate(keyframes, {
        duration,
        easing: 'cubic-bezier(.4,0,.2,1)',
        fill: 'forwards',
      });
      anim.onfinish = () => {
        el.remove();
        live--;
      };
    };

    /** 通った道に 1 枚落とす */
    const drop = (x: number, y: number) => {
      const now = performance.now();
      if (now - lastDrop < DROP_INTERVAL_MS) return;
      lastDrop = now;

      const s = 10 + Math.random() * 8;
      add(
        `left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px;` +
          `background:${Math.random() < 0.25 ? 'var(--sun)' : 'var(--ink)'};`,
        [
          { transform: 'scale(1) rotate(0deg)', opacity: 0.85 },
          { transform: 'scale(0) rotate(45deg)', opacity: 0 },
        ],
        TILE_LIFE_MS,
      );
    };

    /** タップした場所で弾けさせる */
    const burst = (x: number, y: number) => {
      for (let i = 0; i < BURST_COUNT; i++) {
        const a = (Math.PI * 2 * i) / BURST_COUNT;
        const d = 34 + Math.random() * 40;
        const s = 8 + Math.random() * 7;
        add(
          `left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px;` +
            `background:${i % 3 === 0 ? 'var(--sun)' : 'var(--ink)'};`,
          [
            { transform: 'translate(0,0) rotate(0deg)', opacity: 0.9 },
            {
              transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) rotate(90deg) scale(0)`,
              opacity: 0,
            },
          ],
          BURST_LIFE_MS,
        );
      }
    };

    const onMove = (e: PointerEvent) => {
      // 指でなぞったときは軌跡を出さない。タップの弾けだけにする
      if (e.pointerType === 'touch') return;
      drop(e.clientX, e.clientY);
    };
    const onDown = (e: PointerEvent) => burst(e.clientX, e.clientY);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      layer.replaceChildren();
    };
  }, []);

  return <div ref={layerRef} className="trail" aria-hidden="true" />;
}
