import Image from 'next/image';
import Link from 'next/link';
import { AuthHashHandler } from '@/components/auth-hash-handler';
import { PublicNav } from '@/components/PublicNav';
import { headers } from 'next/headers';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <AuthHashHandler />

      <PublicNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen w-full pb-20 md:pb-0 md:pl-64">
        {/* Mobile Header for Logo */}
        <header className="md:hidden mt-8 mb-2 flex justify-center items-center">
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Safezone Cup Logo"
              width={240}
              height={240}
              className="h-16 w-auto object-contain"
            />
          </Link>
        </header>

        <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
