import Link from 'next/link';
import BackLink from '@/components/BackLink';
import Image from 'next/image';
import { asset } from '@/lib/basePath';
import type { Metadata } from 'next';
import { getRirekisho, getSkills } from '@/lib/content.server';
import Wordmark from '@/components/Wordmark';
import Reveal from '@/components/Reveal';
import SkillTable from '@/components/SkillTable';

export const metadata: Metadata = { title: 'rirekisho — keepSTEEP' };

/* スキル欄だけは絞り込みが要るので、md の中に置いた目印でここだけ差し替える。
   目印より前と後ろは、今までどおり md をそのまま流し込む */
const SKILL_MARKER = '<!--skills-->';

export default function RirekishoPage() {
  const rirekisho = getRirekisho();
  const skills = getSkills();
  const [before, after] = rirekisho
    ? rirekisho.html.split(SKILL_MARKER)
    : ['', ''];

  return (
    <div className="sheet">
      <Wordmark />

      <Reveal>
        <article className="article">
          {/* 仕事を頼むか判断するページなので、ここには顔を出す */}
          <header className="who">
            <Image
              src={asset("/avatar.webp")}
              alt="oudon"
              width={700}
              height={700}
              priority
              className="who__avatar"
            />
            <h1 className="article__title article__title--plain who__name">
              {rirekisho?.title ?? 'rirekisho'}
            </h1>
          </header>

          {rirekisho ? (
            <>
              <div
                className="prose prose--rirekisho"
                dangerouslySetInnerHTML={{ __html: before }}
              />
              {skills.length > 0 && <SkillTable skills={skills} />}
              {after !== undefined && (
                <div
                  className="prose prose--rirekisho"
                  dangerouslySetInnerHTML={{ __html: after ?? '' }}
                />
              )}
            </>
          ) : (
            <p className="prose prose--empty">content/rirekisho.md がまだない。</p>
          )}

          <BackLink href="/">
            ← modoru
          </BackLink>
        </article>
      </Reveal>
    </div>
  );
}
