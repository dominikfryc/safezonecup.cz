'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const [teamName, setTeamName] = useState<string | null>(null);

  useEffect(() => {
    if (pathname?.startsWith('/admin/teams/')) {
      const parts = pathname.split('/');
      const id = parts[3];
      if (id) {
        const fetchTeam = async () => {
          const supabase = createClient();
          const { data } = await supabase.from('teams').select('name').eq('id', id).single();
          if (data) setTeamName(data.name);
        };
        fetchTeam();
      }
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTeamName(null);
    }
  }, [pathname]);

  if (pathname?.startsWith('/admin/teams/') && pathname.split('/').length >= 4) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/teams">Teams</BreadcrumbLink>
          </BreadcrumbItem>
          {teamName && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{teamName}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const getBreadcrumbs = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname === '/admin/tournaments') return 'Tournaments';
    if (pathname === '/admin/teams') return 'Teams';
    if (pathname === '/admin/matches') return 'Matches';
    if (pathname === '/admin/settings') return 'Settings';
    return 'Admin Panel';
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{getBreadcrumbs()}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
