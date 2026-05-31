"use client"

import Link from "next/link"
import * as React from "react"
import { ChevronsUpDown, TrophyIcon, ArrowRight } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { setAdminTournamentCookie } from "@/app/admin/actions"

import { useRouter } from "next/navigation"

export function TournamentSwitcher({
  tournaments,
  activeTournamentId,
}: {
  tournaments: {
    id: string
    year: number
    location: string | null
    is_active: boolean
  }[]
  activeTournamentId: string
}) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const activeTournament = tournaments.find((t) => t.id === activeTournamentId) || tournaments[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TrophyIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  SAFEZONE CUP {activeTournament?.year}
                </span>
                <span className="truncate text-xs">
                  {activeTournament?.location || 'No location'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Select Tournament
            </DropdownMenuLabel>
            {tournaments.map((tournament) => (
              <DropdownMenuItem
                key={tournament.id}
                onClick={async () => {
                  await setAdminTournamentCookie(tournament.id)
                  router.push('/admin')
                }}
                className="gap-2 p-2 cursor-pointer"
              >

                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">SAFEZONE CUP {tournament.year}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2 cursor-pointer" asChild>
              <Link href="/admin/tournaments" className="flex items-center gap-3">
                <ArrowRight className="size-4 text-muted-foreground" />
                <div className="font-medium text-muted-foreground">Manage Tournaments</div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
