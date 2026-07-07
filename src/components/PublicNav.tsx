'use client';

import { Calendar, LayoutGrid, Trophy, Target, Home } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function PublicNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Domů', icon: Home, exact: true },
    { href: '/matches', label: 'Zápasy', icon: Calendar },
    { href: '/groups', label: 'Skupiny', icon: LayoutGrid },
    { href: '/playoffs', label: 'Play-off', icon: Trophy },
    { href: '/scorers', label: 'Střelci', icon: Target },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white/90 backdrop-blur-xl border-t border-border p-2 pb-safe md:top-0 md:bottom-0 md:right-auto md:flex-col md:justify-start md:w-64 md:border-t-0 md:border-r md:p-4 md:items-start gap-1 md:gap-2 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:shadow-none">
      <Link href="/" className="hidden md:flex items-center justify-center w-full mt-4 mb-8">
        <Image
          src="/logo.png"
          alt="Safezone Cup Logo"
          width={128}
          height={128}
          className="w-full max-w-32 h-auto object-contain"
          priority
        />
      </Link>

      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:w-full md:px-4 md:py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-secondary text-black'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-black'
            }`}
          >
            <Icon className="w-5 h-5 md:w-5 md:h-5" />
            <span className="text-xs md:text-sm font-semibold">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
