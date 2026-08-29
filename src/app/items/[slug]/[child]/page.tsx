import Link from 'next/link';
import BackLink from '@/components/BackLink';
import Image from 'next/image';
import { asset } from '@/lib/basePath';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getChild, getItem, getItems, renderMarkdown } from '@/lib/content.server';
import Wordmark from '@/components/Wordmark';
import Reveal from '@/components/Reveal';

export function generateStaticParams() {
  return getItems().flatMap((i) => i.children.map((c) => ({ slug: i.slug, child: c.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; child: string }>;
}): Promise<Metadata> {
  const { slug, child } = await params;
  const c = getChild(slug, child);
  return { title: c ? `${c.title} — keepSTEEP` : 'keepSTEEP' };
}

export default async function ChildPage({
  params,
}: {
  params: Promise<{ slug: string; child: string }>;
}) {
  const { slug, child } = await params;
  const parent = getItem(slug);
  const c = getChild(slug, child);
  if (!parent || !c) notFound();

  const html = renderMarkdown(c.body);

  // 同じ物の中の前後。読み終わったら次に行けるようにする
  const idx = parent.children.findIndex((x) => x.slug === c.slug);
  const prev = parent.children[idx - 1];
  const next = parent.children[idx + 1];

  return (
    <div className="sheet">
      <Wordmark />

      <Reveal>
        <article className="article">
          {/* どの物の中に居るのかを示す */}
          <Link href={`/items/${parent.slug}`} className="crumb">
            <span aria-hidden="true">{parent.emoji ?? '◻︎'}</span>
            {parent.title}
          </Link>

          {c.image ? (
            <Image src={asset(c.image)} alt="" width={640} height={480} className="article__photo" />
          ) : (
            <span className="article__art" aria-hidden="true">
              {c.emoji ?? '◻︎'}
            </span>
          )}

          {c.date && (
            <div className="article__meta">
              <span className="article__date">{c.date}</span>
            </div>
          )}

          <h1 className="article__title">{c.title}</h1>

          {html ? (
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="prose prose--empty">まだ何も書いていない。</p>
          )}

          <nav className="siblings">
            {prev && (
              <Link href={`/items/${parent.slug}/${prev.slug}`} className="siblings__link">
                ← {prev.title}
              </Link>
            )}
            {next && (
              <Link
                href={`/items/${parent.slug}/${next.slug}`}
                className="siblings__link siblings__link--next"
              >
                {next.title} →
              </Link>
            )}
          </nav>

          <BackLink href={`/items/${parent.slug}`}>
            ← {parent.title} ni modoru
          </BackLink>
        </article>
      </Reveal>
    </div>
  );
}
