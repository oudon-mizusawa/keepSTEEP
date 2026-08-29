'use client';

import { motion, useTransform, type MotionValue } from 'motion/react';
import { asset } from '@/lib/basePath';

/**
 * 屋号 keepSTEEP。風景は足さない。主役はこの文字だけ。
 *
 * STEEP の 5 文字が右に向かって坂を登る。
 * ヒーローではスクロール量に応じて勾配が 4° から 12° へきつくなる。
 * 下にスクロールするほど坂が急になる、という矛盾が仕掛け。
 * 「急勾配」という意味をどこにも書かずに、操作そのものにしている。
 *
 * 文字は 1 つずつ摘まめる。手を離すとバネで戻る。
 * 散らかし平面の物と同じ手触りにして、サイト全体の操作言語を揃えている。
 */
const STEEP = ['S', 'T', 'E', 'E', 'P'];

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 20 };

type Props = {
  /** hero = 主役サイズ / corner = 隅に置く小さいやつ */
  variant?: 'hero' | 'corner';
  /** 0→1 のスクロール進捗。渡すと勾配がそれに追従する */
  climb?: MotionValue<number>;
  /** 文字を摘まめるかどうか。タッチ端末ではスクロールを奪うので false にする */
  draggable?: boolean;
};

function HeroLetter({
  ch,
  i,
  climb,
  draggable,
}: {
  ch: string;
  i: number;
  climb: MotionValue<number>;
  draggable: boolean;
}) {
  // 奥の文字ほど高く上がる。勾配がきつくなると差も開く
  const y = useTransform(climb, [0, 1], [-i * 7, -i * 22]);
  const rotate = useTransform(climb, [0, 1], [-4, -12]);

  return (
    <motion.span className="mark__ch" style={{ y, rotate }}>
      <motion.span
        className="mark__grab"
        drag={draggable}
        dragSnapToOrigin
        dragElastic={0.5}
        whileHover={{ scale: 1.14 }}
        whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
        transition={SPRING}
      >
        {ch}
      </motion.span>
    </motion.span>
  );
}

export default function Wordmark({ variant = 'corner', climb, draggable = true }: Props) {
  const hero = variant === 'hero';

  // ヒーロー: スクロールが勾配を動かす。文字は摘まめる
  if (hero && climb) {
    return (
      <span className="mark mark--hero" aria-label="keepSTEEP">
        <span className="mark__keep">keep</span>
        <span className="mark__steep" aria-hidden="true">
          {STEEP.map((ch, i) => (
            <HeroLetter key={i} ch={ch} i={i} climb={climb} draggable={draggable} />
          ))}
        </span>
      </span>
    );
  }

  // 隅の小さいやつ: ホバーで勾配がきつくなる
  return (
    <motion.a
      // next/link ではないので basePath は自動で付かない
      href={asset('/')}
      className="mark"
      initial="rest"
      whileHover="climb"
      animate="rest"
      aria-label="keepSTEEP"
    >
      <span className="mark__keep">keep</span>
      <span className="mark__steep" aria-hidden="true">
        {STEEP.map((ch, i) => (
          <motion.span
            key={i}
            className="mark__ch"
            variants={{
              rest: { y: -i * 2.5, rotate: -2 },
              climb: { y: -i * 6.5, rotate: -7 },
            }}
            transition={{ ...SPRING, delay: i * 0.025 }}
          >
            {ch}
          </motion.span>
        ))}
      </span>
    </motion.a>
  );
}
