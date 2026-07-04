'use client';

import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TournamentSwitcher } from '@/components/tournament-switcher';
import { Tournament } from '@/lib/types';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { LayoutDashboardIcon, UsersIcon, TrophyIcon, CalendarIcon } from 'lucide-react';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: <LayoutDashboardIcon />,
    },
    {
      title: 'Teams',
      url: '/admin/teams',
      icon: <UsersIcon />,
    },
    {
      title: 'Matches',
      url: '/admin/matches',
      icon: <TrophyIcon />,
    },
    {
      title: 'Schedule',
      url: '/admin/schedule',
      icon: <CalendarIcon />,
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
