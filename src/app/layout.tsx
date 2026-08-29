import type { Metadata } from 'next';
import Spinner from '@/components/Spinner';
import CursorTrail from '@/components/CursorTrail';
import { display, sans, mono } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'keepSTEEP',
  description: 'ソフトウェアをつくる個人事業主です',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <Spinner />
        {children}
        <CursorTrail />
      </body>
    </html>
  );
}
