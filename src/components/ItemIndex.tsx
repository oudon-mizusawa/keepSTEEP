'use client';

import Link from 'next/link';
import BackLink from './BackLink';
import Image from 'next/image';
import { motion } from 'motion/react';
import type { Child, Item } from '@/lib/items';
import Wordmark from './Wordmark';

/**
 * 物を開いた先。
 * トップの「散らかし」は発見のための言語だが、
 * 中まで散らかすと選ぶのが苦痛になる。ここは読むための形にする。
 */
function excerpt(body: string): string {
  const line = body
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('#'));
  return line ?? '';
}

export default function ItemIndex({ item, intro }: { item: Item; intro: string }) {
  return (
    <div className="sheet sheet--index">
      <Wordmark />

      <div className="index">
        <motion.header
          className="index__head"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        >
          {item.image ? (
            <Image src={item.image} alt="" width={200} height={200} className="index__photo" />
          ) : (
            <span className="index__art" aria-hidden="true">
              {item.emoji ?? '◻︎'}
            </span>
          )}
          <div>
            <h1 className="index__title">{item.title}</h1>
            {intro && <p className="index__intro">{intro}</p>}
          </div>
        </motion.header>

        <ul className="entries">
          {item.children.map((c: Child, i) => (
            <motion.li
              key={c.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.12 + i * 0.06,
                type: 'spring',
                stiffness: 210,
                damping: 24,
              }}
            >
              <Link href={`/items/${item.slug}/${c.slug}`} className="entry">
                {c.image ? (
                  <Image src={c.image} alt="" width={120} height={120} className="entry__photo" />
                ) : (
                  <span className="entry__art" aria-hidden="true">
                    {c.emoji ?? '◻︎'}
                  </span>
                )}
                <span className="entry__text">
                  <span className="entry__title">{c.title}</span>
                  <span className="entry__excerpt">{excerpt(c.body)}</span>
                </span>
                {c.date && <span className="entry__date">{c.date}</span>}
              </Link>
            </motion.li>
          ))}
        </ul>

        <BackLink href="/">
          ← modoru
        </BackLink>
      </div>
    </div>
  );
}
