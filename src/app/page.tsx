import Hero from '@/components/Hero';
import ScatterPlane from '@/components/ScatterPlane';
import { getItems } from '@/lib/content.server';

// md の読み取りはサーバ側（ビルド時）。クライアントには結果だけ渡す。
export default function Page() {
  const items = getItems();
  return (
    <>
      <Hero />
      <ScatterPlane items={items} />
    </>
  );
}
