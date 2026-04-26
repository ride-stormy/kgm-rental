import localFont from 'next/font/local';
import { Providers } from './providers';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const gmarketSans = localFont({
  src: [
    {
      path: '../public/fonts/GmarketSansLight.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/GmarketSansMedium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/GmarketSansBold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-gmarket',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KGM 렌털 — 장기렌트 견적',
  description: 'KGM 차량 장기렌트 견적/재고 플랫폼 (Stage A)',
};

interface RootLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function RootLayout({ children, modal }: RootLayoutProps): JSX.Element {
  return (
    <html lang="ko" className={gmarketSans.variable}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-screen bg-slate-50 antialiased">
        <Providers>
          {children}
          {modal}
        </Providers>
      </body>
    </html>
  );
}
