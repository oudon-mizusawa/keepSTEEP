/**
 * サイトを配る場所のプレフィックス。
 *
 * 今は oudon-mizusawa.github.io（ユーザーサイト）の root で配っているので空。
 * リポジトリ名の下（プロジェクトページ）に移すときだけ '/リポジトリ名' を入れる。
 *
 * next/link と、最適化ありの next/image は basePath を自動で足してくれるが、
 * images.unoptimized: true にしていると next/image は src をそのまま出すため、
 * /avatar.png や /exhibition/*.jpg が本番でドメイン直下を指して 404 になる。
 * 画像の src はこの asset() を通して自分で足す。
 *
 * next.config.ts もこの値を読むので、変えるときはここ 1 箇所でよい。
 */
export const BASE_PATH = '';

/** public 配下の絶対パスに basePath を足す。外部URLやデータURIはそのまま返す */
export function asset(src: string): string {
  if (!src.startsWith('/')) return src;
  if (!BASE_PATH) return src;
  if (src.startsWith(`${BASE_PATH}/`)) return src;
  return `${BASE_PATH}${src}`;
}

/**
 * 平面や一覧に並べる小さいカード用の画像。
 * 表示は最大 232px なので、詳細ページと同じ 720px を配るのは無駄。
 * 幅 480px に落とした -sm 版を用意してあるので、そちらへ向ける。
 */
export function thumb(src: string): string {
  return asset(src.replace(/\.webp$/, '-sm.webp'));
}
