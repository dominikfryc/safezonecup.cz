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
  const [matchTitle, setMatchTitle] = useState<string | null>(null);

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
      setTeamName(null);
    }

    if (pathname?.startsWith('/admin/matches/')) {
      const parts = pathname.split('/');
      const id = parts[3];
      if (id) {
        const fetchMatch = async () => {
          const supabase = createClient();
          const { data } = await supabase
            .from('matches')
            .select('home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)')
            .eq('id', id)
            .single();
          if (data) {
            const home = (data.home_team as unknown as { name: string })?.name || '?';
            const away = (data.away_team as unknown as { name: string })?.name || '?';
            setMatchTitle(`${home} - ${away}`);
          }
        };
        fetchMatch();
      }
    } else {
      setMatchTitle(null);
    }
  }, [pathname]);

  if (pathname?.startsWith('/admin/teams/') && pathname.split('/').length >= 4) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/teams">Týmy</BreadcrumbLink>
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

  if (pathname?.startsWith('/admin/matches/') && pathname.split('/').length >= 4) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/matches">Zápasy</BreadcrumbLink>
          </BreadcrumbItem>
          {matchTitle && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{matchTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const getBreadcrumbs = () => {
    if (pathname === '/admin') return 'Přehled';
    if (pathname === '/admin/tournaments') return 'Turnaje';
    if (pathname === '/admin/teams') return 'Týmy';
    if (pathname === '/admin/schedule') return 'Harmonogram';
    if (pathname === '/admin/matches') return 'Zápasy';
    if (pathname === '/admin/settings') return 'Nastavení';
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
