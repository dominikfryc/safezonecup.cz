"use client"

import { useState } from "react"
import { CheckCircle2, MoreHorizontal, Pencil } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { buttonVariants } from "@/components/ui/button"
import { EditTournamentDialog } from "./edit-tournament-dialog"
import { setActiveTournament } from "./actions"

import { Tournament } from "@/lib/types"

export function TournamentActions({ 
  tournament 
}: { 
  tournament: Tournament
}) {
  const [showEdit, setShowEdit] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setShowEdit(true)}>
            <Pencil className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          {!tournament.is_active && (
            <DropdownMenuItem asChild>
              <form action={async () => {
                await setActiveTournament(tournament.id)
              }}>
                <button type="submit" className="w-full text-left flex items-center gap-2">
                  <CheckCircle2 className="mr-2 size-4" />
                  Set Active
                </button>
              </form>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTournamentDialog 
        tournament={tournament}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
    </>
  )
}
