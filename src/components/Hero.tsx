'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useScroll, useTransform, type Variants } from 'motion/react';
import { useIsMobile } from '@/lib/useIsMobile';
import Wordmark from './Wordmark';

/**
 * ファーストビュー。
 *
 * ここの仕事は 3 つだけ。
 *   1. keepSTEEP であると伝える
 *   2. 実際にやっていることを書く
 *   3. 面白がって下までスクロールしてもらう
 *
 * 強みの説明は rirekisho に置く。ここで営業しない。
 * 風景（山・海・霧）は足さない。主役は常に屋号そのもの。
 * スクロールすると STEEP の勾配が険しくなる、それだけで足りる。
 *
 * 屋号は普通の文書内に置くと、スクロールした瞬間に画面外へ流れて
 * 険しくなる過程がほとんど見えなかった。
 * トラック（丈の長い透明な器）の中で画面に貼り付け（sticky）にし、
 * その間だけスクロール量を 0→1 として拾う。
 */

/** 仕事として請けられる領域。電子工作と回路設計は趣味なので下の趣味欄に分けている */
const WORK = ['Webアプリ', 'モバイルアプリ', 'バックエンド', 'インフラ'];

const HOBBY = ['自転車', '電子工作'];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.09, type: 'spring' as const, stiffness: 180, damping: 22 },
  }),
};

export default function Hero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // トラック全体（画面 1.8 個ぶん）をスクロールする間を 0→1 として扱う
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  /*
   * タッチ端末では勾配をスクロールに追従させない。
   * sticky で 1.8 画面ぶん貼り付ける仕掛けは、指で払っても画面が進まないので
   * «動かしにくい» と感じる原因になっていた。CSS 側でも sticky を外している。
   */
  const flat = useMotionValue(0);
  const climb = isMobile ? flat : scrollYProgress;
  const cueOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div className="hero-track" ref={trackRef}>
      <section className="hero">
        <div className="hero__inner">
          <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp}>
            <Wordmark variant="hero" climb={climb} draggable={!isMobile} />
          </motion.div>

          <motion.p className="hero__lead" initial="hidden" animate="show" custom={1} variants={fadeUp}>
            横浜でWebアプリ・モバイルアプリ・バックエンドをつくっています。
          </motion.p>

          <motion.ul className="hero__stack" initial="hidden" animate="show" custom={3} variants={fadeUp}>
            {WORK.map((s) => (
              <li key={s} className="pill">
                {s}
              </li>
            ))}
          </motion.ul>

          {/* 趣味は仕事の領域と混ぜない。線を引いて、静かに置く */}
          <motion.p className="hero__hobby" initial="hidden" animate="show" custom={4} variants={fadeUp}>
            <span className="hero__hobby-key">趣味</span>
            {HOBBY.join(' / ')}
          </motion.p>
        </div>

        <motion.div
          className="hero__cue"
          aria-hidden="true"
          style={{ opacity: cueOpacity }}
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          ↓
        </motion.div>
      </section>
    </div>
  );
}
