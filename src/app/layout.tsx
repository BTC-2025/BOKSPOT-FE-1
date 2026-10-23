import type { Metadata } from 'next';
import { ThemeManager } from '../components/ThemeManager';
import ClientLayout from '../components/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'BOKSPOT — Book Everything',
  description: 'BOKSPOT — The unified platform to book every service, turf, stay, and experience.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body suppressHydrationWarning className="bg-[color:var(--color-surface)] text-[color:var(--color-on-surface)] selection:bg-primary/30">
        <ThemeManager />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

