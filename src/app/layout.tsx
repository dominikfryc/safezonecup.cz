import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/next';

const satoshi = localFont({
  src: '../fonts/Satoshi-Variable.woff2',
  variable: '--font-sans',
  display: 'swap',
  weight: '300 900',
});

import { createClient } from '@/utils/supabase/server';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('name')
    .eq('is_active', true)
    .limit(1);
  const activeTournament = tournaments?.[0];
  const tournamentName = activeTournament?.name || 'SAFEZONE CUP';

  return {
    title: {
      template: `%s | ${tournamentName}`,
      default: tournamentName,
    },
    description: 'Official Tournament Dashboard',
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn('h-full antialiased font-sans', satoshi.variable)}
      style={{ scrollbarGutter: 'stable' }}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
