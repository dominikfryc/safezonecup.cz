'use client';

import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TournamentSwitcher } from '@/components/tournament-switcher';
import { Tournament } from '@/lib/types';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { LayoutDashboardIcon, UsersIcon, CalendarIcon, ClockIcon } from 'lucide-react';

const data = {
  navMain: [
    {
      title: 'Přehled',
      url: '/admin',
      icon: <LayoutDashboardIcon />,
    },
    {
      title: 'Týmy',
      url: '/admin/teams',
      icon: <UsersIcon />,
    },
    {
      title: 'Zápasy',
      url: '/admin/matches',
      icon: <CalendarIcon />,
    },
    {
      title: 'Harmonogram',
      url: '/admin/schedule',
      icon: <ClockIcon />,
    },
  ],
};

export function AppSidebar({
  email,
  userName,
  tournaments,
  activeTournamentId,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  email: string;
  userName: string;
  tournaments: Tournament[];
  activeTournamentId: string;
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TournamentSwitcher tournaments={tournaments} activeTournamentId={activeTournamentId} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: userName, email: email, avatar: '' }} />
      </SidebarFooter>
    </Sidebar>
  );
}
