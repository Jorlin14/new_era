import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import Providers from '@/components/Providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'New Era Supermercado | Tu súper fresco, rápido y directo a tu hogar',
  description:
    'Productos frescos y de calidad con entrega a domicilio. Frutas, verduras, lácteos, carnes y más — directo a la puerta de tu hogar en minutos.',
  keywords: [
    'supermercado',
    'domicilio',
    'mercado online',
    'productos frescos',
    'entrega rápida',
    'Colombia',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0C447C' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            })();
          `}
        </Script>
        <Script src="https://cdn.lordicon.com/lordicon.js" strategy="lazyOnload" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
