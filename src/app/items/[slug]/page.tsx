import Link from 'next/link';
import BackLink from '@/components/BackLink';
import Image from 'next/image';
import { asset } from '@/lib/basePath';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getItem, getItems, renderMarkdown } from '@/lib/content.server';
import { CATEGORY_LABEL } from '@/lib/items';
import Wordmark from '@/components/Wordmark';
import Reveal from '@/components/Reveal';
import ItemIndex from '@/components/ItemIndex';

export function generateStaticParams() {
  return getItems().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem(slug);
  return { title: item ? `${item.title} — keepSTEEP` : 'keepSTEEP' };
}

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) notFound();

  // 中に記事を持つ物は、記事ページではなく「開いた平面」になる
  if (item.children.length > 0) {
    return <ItemIndex item={item} intro={item.body.split('\n')[0] ?? ''} />;
  }

  const html = renderMarkdown(item.body);

  return (
    <div className="sheet">
      <Wordmark />

      <Reveal>
        <article className="article">
          {item.image ? (
            <Image src={asset(item.image)} alt="" width={640} height={480} className="article__photo" />
          ) : (
            <span className="article__art" aria-hidden="true">
              {item.emoji ?? '◻︎'}
            </span>
          )}

          <div className="article__meta">
            <span className="article__cat">{CATEGORY_LABEL[item.category]}</span>
            {item.date && <span className="article__date">{item.date}</span>}
          </div>

          <h1 className="article__title">{item.title}</h1>

          {html ? (
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="prose prose--empty">まだ何も書いていない。</p>
          )}

          <BackLink href="/">
            ← modoru
          </BackLink>
        </article>
      </Reveal>
    </div>
  );
}
