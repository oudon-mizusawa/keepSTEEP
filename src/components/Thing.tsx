'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { asset } from '@/lib/basePath';
import { motion } from 'motion/react';
import { hash } from '@/lib/scatter';
import type { Placed } from '@/lib/items';

const SPRING = { type: 'spring' as const, stiffness: 220, damping: 26, mass: 0.9 };

/**
 * 平面に散らかっている物 1 個。
 * 摘まめて、ホバーで拡大して、ゆっくり漂う。クリックすると開く。
 *
 * タッチ端末にはホバーがないので、1 回目のタップで拡大とタイトル表示（PC のホバー相当）、
 * 2 回目のタップで実際に開く、という 2 段階にする。
 */
export default function Thing({
  item,
  pos,
  active,
  onActivate,
  draggable = true,
  float = true,
}: {
  item: Placed;
  pos: { x: number; y: number };
  /** タッチ端末で「ホバー状態」になっているか */
  active?: boolean;
  /** ホバー状態にしてほしいときに呼ぶ。渡されなければ従来どおり 1 タップで遷移 */
  onActivate?: (slug: string) => void;
  /**
   * 摘まめるかどうか。タッチ端末では false にする。
   * 指のスワイプがドラッグに吸われて、ページを縦にスクロールできなくなるため。
   */
  draggable?: boolean;
  /** ゆっくり漂わせるか。非力な端末では止める */
  float?: boolean;
}) {
  // ドラッグで摘まんだのか、クリックしたのかを区別する。
  // これが無いと、少し動かしただけで遷移してしまう。
  const down = useRef<{ x: number; y: number } | null>(null);
  // ポインタがタッチだったかどうか。マウスなら 2 段階にしない
  const [wasTouch, setWasTouch] = useState(false);

  const drift = 4 + hash(item.slug) * 5;
  const dur = 5 + hash(item.slug + '#d') * 4;

  return (
    <motion.div
      /* layout は付けない。並び替えも絞り込みもしないので、
         18 枚ぶんの寸法測定と差分アニメが毎レンダリング走るだけ損になる */
      className={active ? 'thing is-active' : 'thing'}
      // top は vh（絶対長さ）で置く。% だと親の高さに対する割合になり、
      // 物が増えて平面を下に伸ばしても、既存の物まで一緒に間延びしてしまう。
      // vh なら「上から何 vh の位置か」が固定されるので、平面がどれだけ伸びても崩れない。
      style={{ left: `${pos.x}%`, top: `${pos.y}vh` }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={SPRING}
    >
      {/* 摘まめる。手を離すと戻る。意味はない。 */}
      <motion.div
        drag={draggable}
        dragSnapToOrigin
        dragElastic={0.55}
        whileHover={{ scale: item.scale * 1.18, rotate: 0 }}
        whileDrag={{ scale: item.scale * 1.25, rotate: 0, cursor: 'grabbing' }}
        animate={
          active
            ? { rotate: 0, scale: item.scale * 1.18 }
            : { rotate: item.rotate, scale: item.scale }
        }
        transition={SPRING}
      >
        {/* ゆらぎ。18 枚ぶんが毎フレーム動き続けるので、
            非力な端末では効かせない（摘まめないモバイルでは効果も薄い） */}
        <motion.div
          animate={float ? { y: [0, -drift, 0] } : undefined}
          transition={float ? { duration: dur, repeat: Infinity, ease: 'easeInOut' } : undefined}
        >
          <Link
            href={item.href}
            className="thing__link"
            onPointerDown={(e) => {
              down.current = { x: e.clientX, y: e.clientY };
              setWasTouch(e.pointerType === 'touch');
            }}
            onClick={(e) => {
              const d = down.current;
              if (d) {
                // 5px 以上動いていたら「摘まんだ」とみなして遷移させない
                if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) {
                  e.preventDefault();
                  return;
                }
              }
              // タッチで、まだホバー状態でないなら、1 回目は開かずに拡大だけ
              if (wasTouch && onActivate && !active) {
                e.preventDefault();
                onActivate(item.slug);
              }
            }}
          >
            {item.image ? (
              <Image
                src={asset(item.image)}
                alt=""
                width={320}
                height={240}
                className="thing__photo"
              />
            ) : (
              <span className="thing__art" aria-hidden="true">
                {item.emoji ?? '◻︎'}
              </span>
            )}
            <span className="thing__label">{item.title}</span>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
