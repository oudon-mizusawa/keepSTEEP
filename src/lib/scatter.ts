/**
 * 決定的なハッシュ。同じ slug からは毎回同じ値が出る。
 * ゆらぎアニメの周期と、傾き・横位置のばらつきに使う。
 */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/**
 * 平面の配置。
 *
 * 決め方は 2 段階。
 *   1. 縦位置: 通し番号 n → n 番目の列。列ごとに「1 つ上の物の下端 + 隙間」に積む。
 *      等間隔の表で決め打ちにすると横長の写真の下に余白が空くので、実際のカード高で積む。
 *   2. 傾きと横のずれ: 物ごとに slug から決める。
 *      通し番号の周期（ROTATIONS を 10 個で回す等）でやると、列数と噛み合って
 *      「左列は全部左に傾く」のような縞が見えてしまった。slug 由来なら周期が出ない。
 *      ハッシュは毎回同じ値を返すので、再読み込みしても位置は動かない。
 *
 * カード高は実測から出した式で求める（1400x900 で 4 枚を計測し、誤差 2px 以内で一致）:
 *   カード高 = (幅 - 枠×2) × 縦横比 + 枠×2 + ラベル
 * さらに傾けているぶん、場所を取る幅と高さは外接矩形まで膨らむ。
 */
export type Slot = { x: number; y: number; rotate: number; scale: number };

export type Card = { slug: string; ratio: number };

/** 列の中心の x（左からの %）。3 列 / 2 列 */
const DESKTOP_COLUMNS = [17, 49, 81];
const MOBILE_COLUMNS = [25, 75];

/**
 * 列の頭を最初からずらしておく。
 * 積み上げ式なので下に行くほど自然にズレていくが、1 枚目だけは必ず揃ってしまうため。
 */
const DESKTOP_STAGGER = [0, 62, 26];
const MOBILE_STAGGER = [0, 78];

/** 列の中心からどれだけ横にずらしてよいか(%)。列の間隔からカード幅を引いた余りの内側に収める */
const X_SPREAD = 5;

/** 傾き(度)。この範囲で物ごとに散らす。0 付近も含めて偏りをなくす */
const TILT_MAX = 7;

/** 画面の左右に必ず残す余白(%)。傾いたカードが端に貼りつかないように */
const EDGE_MARGIN = 2;

/** 縦に積むときの最低の隙間(px)。ここを小さくすると全体が詰まる */
const GAP_PX = { desktop: 34, mobile: 22 };
/** 隙間に上乗せする幅(px)。物ごとに 0〜この値だけ余分に空ける。詰まりすぎた等間隔を崩す */
const GAP_SPREAD_PX = { desktop: 26, mobile: 16 };
/** 1 枚目の上端(px) */
const TOP_PX = { desktop: 90, mobile: 70 };
/** 一番下の物の下に残す余白(px)。フッターとナビのぶん */
const BOTTOM_PX = { desktop: 220, mobile: 180 };

/** 枠線とラベルのぶん。globals.css の .thing__photo / .thing__label と対応する */
const BORDER_PX = { desktop: 6, mobile: 4 };
const LABEL_PX = 19;

const clamp = (lo: number, v: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** globals.css の .thing__photo の width: clamp(...) をそのまま写したもの */
function cardWidthPx(vw: number, isMobile: boolean): number {
  return isMobile ? clamp(112, 0.38 * vw, 160) : clamp(152, 0.17 * vw, 232);
}

/** まっすぐ立てたときのカード高(px) */
function uprightHeightPx(widthPx: number, ratio: number, isMobile: boolean): number {
  const b = isMobile ? BORDER_PX.mobile : BORDER_PX.desktop;
  return (widthPx - b * 2) * ratio + b * 2 + LABEL_PX;
}

/** 傾けた結果、実際に場所を取る外接矩形 */
function rotatedBox(w: number, h: number, deg: number): { w: number; h: number } {
  const r = (Math.abs(deg) * Math.PI) / 180;
  const s = Math.sin(r);
  const c = Math.cos(r);
  return { w: w * c + h * s, h: w * s + h * c };
}

export type Layout = {
  slots: Map<string, Slot>;
  /** 平面の高さ(vh)。一番深い列に合わせる */
  height: number;
};

export function layoutFor(cards: Card[], isMobile: boolean, vw: number, vh: number): Layout {
  const columns = isMobile ? MOBILE_COLUMNS : DESKTOP_COLUMNS;
  const stagger = isMobile ? MOBILE_STAGGER : DESKTOP_STAGGER;
  const gap = isMobile ? GAP_PX.mobile : GAP_PX.desktop;
  const gapSpread = isMobile ? GAP_SPREAD_PX.mobile : GAP_SPREAD_PX.desktop;
  const top = isMobile ? TOP_PX.mobile : TOP_PX.desktop;
  const bottom = isMobile ? BOTTOM_PX.mobile : BOTTOM_PX.desktop;

  const w = cardWidthPx(vw, isMobile);
  // 各列の「次に置ける上端」(px)
  const cursor = columns.map((_, c) => top + (stagger[c] ?? 0));
  const slots = new Map<string, Slot>();

  cards.forEach((card, i) => {
    const col = i % columns.length;

    // 傾きも横のずれも、通し番号ではなく物ごとに決める（縞を出さないため）
    const tilt = (hash(card.slug + '#t') * 2 - 1) * TILT_MAX;
    const nudge = (hash(card.slug + '#x') * 2 - 1) * X_SPREAD;
    const extraGap = hash(card.slug + '#g') * gapSpread;

    const box = rotatedBox(w, uprightHeightPx(w, card.ratio, isMobile), tilt);

    // Thing は translate:-50% -50% なので、x も y も中心
    const centerPx = cursor[col] + box.h / 2;
    cursor[col] = cursor[col] + box.h + gap + extraGap;

    // 画面の外にはみ出さないところまでで止める
    const halfW = (box.w / 2 / vw) * 100;
    const x = clamp(halfW + EDGE_MARGIN, columns[col] + nudge, 100 - halfW - EDGE_MARGIN);

    slots.set(card.slug, {
      x,
      y: (centerPx / vh) * 100,
      rotate: Number(tilt.toFixed(2)),
      scale: 1,
    });
  });

  const deepest = cards.length ? Math.max(...cursor) : top;
  return { slots, height: Math.max(100, ((deepest + bottom) / vh) * 100) };
}
