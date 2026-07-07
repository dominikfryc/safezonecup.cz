import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

import { AdminBreadcrumbs } from '@/components/admin-breadcrumbs';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch all tournaments for the tenant switcher
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .order('name', { ascending: false });

  const cookieStore = await cookies();
  const cookieTournamentId = cookieStore.get('admin_tournament_id')?.value;

  // Default to globally active tournament if cookie is missing
  const activeGlobally = tournaments?.find((t) => t.is_active);
  const activeTournamentId = cookieTournamentId || activeGlobally?.id || '';

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '17rem',
          '--header-height': '3.5rem',
        } as React.CSSProperties
      }
    >
      <AppSidebar
        email={user.email ?? 'admin@example.com'}
        userName={user.user_metadata?.display_name || 'Admin'}
        tournaments={tournaments || []}
        activeTournamentId={activeTournamentId}
      />
      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 bg-sidebar z-40 px-4 lg:px-6 w-full">
          <div className="flex items-center gap-1 lg:gap-2 flex-1 min-w-0">
            <SidebarTrigger className="-ml-1 md:hidden shrink-0" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-8 md:hidden shrink-0"
            />
            <div className="min-w-0 flex-1">
              <AdminBreadcrumbs />
            </div>
          </div>
          <div className="flex items-center shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link href="/" target="_blank">
                <ExternalLink className="size-4 mr-2" />
                Veřejný web
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col p-4 md:p-6 max-w-240 mx-auto w-full">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
