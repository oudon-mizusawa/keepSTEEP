'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'motion/react';
import type { Item, Placed } from '@/lib/items';
import { layoutFor, type Slot } from '@/lib/scatter';
import { useIsMobile } from '@/lib/useIsMobile';
import { useViewport } from '@/lib/useViewport';
import Thing from './Thing';

/**
 * 傾きと大きさは配置側が決める。
 * frontmatter の rotate/scale は使わない（物ごとに書いていたせいで、
 * 下に並んだ物ばかり小さい、というムラが出ていた）。
 */
/** layoutFor は必ず全件返すので実際には使われない。型を通すための保険 */
const DEFAULT_SLOT: Slot = { x: 50, y: 20, rotate: 0, scale: 1 };

function toPlaced(item: Item, slot: Slot): Placed {
  return {
    slug: item.slug,
    title: item.title,
    emoji: item.emoji,
    image: item.image,
    x: slot.x,
    y: slot.y,
    rotate: slot.rotate,
    scale: slot.scale,
    href: `/items/${item.slug}`,
  };
}

export default function ScatterPlane({ items }: { items: Item[] }) {
  const isMobile = useIsMobile();
  const { vw, vh } = useViewport();
  // タッチ端末で「ホバー状態」にしている物。1 回目のタップでここに入り、
  // 2 回目のタップで実際に開く
  const [touched, setTouched] = useState<string | null>(null);

  // 配置は通し番号で列に振り分け、列ごとに実際のカード高で積む。
  // 平面の高さも、一番深い列に合わせて layoutFor が返す。
  const { slots, height: planeHeight } = useMemo(
    () => layoutFor(items.map((i) => ({ slug: i.slug, ratio: i.ratio })), isMobile, vw, vh),
    [items, isMobile, vw, vh],
  );

  return (
    <main
      className="plane"
      style={{ height: `${planeHeight}vh` }}
      // 物の外をタップしたら、ホバー状態を解除する
      onPointerDown={(e) => {
        if (!(e.target as HTMLElement).closest('.thing')) setTouched(null);
      }}
    >
      <div className="plane__stage">
        <AnimatePresence mode="popLayout">
          {items.map((item) => {
            const slot = slots.get(item.slug) ?? DEFAULT_SLOT;
            return (
              <Thing
                key={item.slug}
                item={toPlaced(item, slot)}
                pos={slot}
                active={touched === item.slug}
                onActivate={setTouched}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <nav className="nav">
        {/* 平面は下に長い。物を見終わったら、指を戻さずに先頭へ帰れるようにする。
            ナビの上に置くのは、下まで来た人の目線がここで止まるから */}
        <button
          type="button"
          className="nav__top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="先頭にもどる"
        >
          <span aria-hidden="true">↑</span>
        </button>
        {/* zenbu / syumi は外した。物が全部 syumi なので、どちらを押しても同じ集合が出て
            «絞り込めるように見えて何も起きない» ボタンになっていた。
            カテゴリが 2 つ以上になったら、また出す */}
        <Link href="/rirekisho" className="nav__link nav__link--page">
          rirekisho
        </Link>
      </nav>

      <footer className="hud">
        <span>oshitsuke 24.1&#8451;</span>
        <span>mizu 22.4&#8451;</span>
        <span>raspi up 41d</span>
      </footer>
    </main>
  );
}
