'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * 「戻る」。
 *
 * <Link href="/"> だと新規遷移になり、平面のスクロール位置が失われて
 * 毎回いちばん上まで巻き戻ってしまう。
 * このサイトから来ている場合はブラウザ履歴を戻して、
 * 見ていた場所にそのまま帰す。
 *
 * 直リンクや検索から来た場合は履歴がないので、href への通常遷移に落とす。
 */
export default function BackLink({
  href,
  children,
  className = 'back',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        // 新しいタブで開く操作は邪魔しない
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

        // このサイト内を辿ってきたときだけ履歴を戻す
        const sameOrigin =
          typeof document !== 'undefined' &&
          document.referrer.startsWith(window.location.origin);

        if (sameOrigin && window.history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
    >
      {children}
    </Link>
  );
}
