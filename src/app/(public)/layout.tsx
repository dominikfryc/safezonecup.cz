import { Trophy } from 'lucide-react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { AuthHashHandler } from '@/components/auth-hash-handler';
import { headers } from 'next/headers';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      <AuthHashHandler />
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div
          className="absolute top-1/3 -right-20 w-80 h-80 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-foreground hidden sm:block">
                SAFEZONE CUP
              </h1>
            </Link>

            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/matches" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Zápasy
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/groups" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Skupiny
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/playoffs" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Play-off
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem className="ml-4">
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/admin">Admin</Link>
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="md:hidden flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/matches">Zápasy</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/groups">Skupiny</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/playoffs">Play-off</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/admin">Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
    </div>
  );
}
