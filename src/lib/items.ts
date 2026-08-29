import { z } from 'zod';

/**
 * 型と定数だけ。node:fs を含まないので、クライアント側からも安全に import できる。
 * ファイル読み取りは content.server.ts が担当する。
 */

/** 平面に置く「物」。座標を持つ */
export const ItemFrontmatter = z.object({
  title: z.string(),
  category: z.enum(['syumi']),
  /** 切り抜き画像。無ければ emoji をプレースホルダとして使う */
  image: z.string().optional(),
  emoji: z.string().optional(),
  // 平面の配置は lib/scatter.ts の固定表（通し番号 → 定位置）が決めるので、
  // ここの x/y/rotate/scale は平面では使われない。
  // 物ごとに書いていたせいで「下に並ぶ物ばかり小さい」ムラが出たため表に一本化した。
  // 既存の md を壊さないようスキーマは残してある。新しい物を足すときは書かなくていい。
  x: z.number().min(0).max(100).default(50),
  y: z.number().min(0).max(2000).default(0),
  rotate: z.number().min(-30).max(30).default(0),
  scale: z.number().min(0.3).max(4).default(1),
  date: z.string().optional(),
});

/**
 * 物の中に入っている記事。
 * 座標は任意。書かなければ自動で散らばるので、
 * 記事を増やすときに位置を考えなくていい。
 */
export const ChildFrontmatter = z.object({
  title: z.string(),
  emoji: z.string().optional(),
  image: z.string().optional(),
  x: z.number().min(0).max(100).optional(),
  y: z.number().min(0).max(2000).optional(),
  rotate: z.number().min(-30).max(30).default(0),
  scale: z.number().min(0.3).max(4).default(1),
  date: z.string().optional(),
});

export type Child = z.infer<typeof ChildFrontmatter> & {
  slug: string;
  parent: string;
  body: string;
};

export type Item = z.infer<typeof ItemFrontmatter> & {
  slug: string;
  body: string;
  /** 中に記事を持つ物（自転車・水耕栽培など）。1枚ものは空配列 */
  children: Child[];
  /**
   * 写真の 高さ÷幅。ビルド時に画像から読む。
   * 平面は列ごとに実際のカード高で詰めるので、横長の写真は縦の間隔も詰まる。
   */
  ratio: number;
};

// ナビの表示順: zenbu, syumi, rirekisho
export const CATEGORIES = ['syumi'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  syumi: 'syumi',
};

/** 平面に置ける最小限の形。ScatterPlane はこれだけ知っていればいい */
export type Placed = {
  slug: string;
  title: string;
  emoji?: string;
  image?: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  href: string;
};

/** 履歴書のスキル欄の 1 行。クライアント側の絞り込みでも使うのでここに置く */
export type Skill = { category: string; experience: string; name: string };
