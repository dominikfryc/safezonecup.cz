"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { buttonVariants } from "@/components/ui/button"
import { EditTeamDialog } from "./edit-team-dialog"
import { DeleteTeamDialog } from "./delete-team-dialog"

import { Team } from "@/lib/types"

export function TeamActions({ 
  team, 
  availableGroups, 
  groupCounts, 
  maxTeamsPerGroup 
}: { 
  team: Team
  availableGroups: string[]
  groupCounts: Record<string, number>
  maxTeamsPerGroup: number 
}) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

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
          <DropdownMenuItem onSelect={() => setShowDelete(true)} variant="destructive">
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTeamDialog 
        team={team}
        availableGroups={availableGroups}
        groupCounts={groupCounts}
        maxTeamsPerGroup={maxTeamsPerGroup}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
      <DeleteTeamDialog 
        team={team} 
        open={showDelete}
        onOpenChange={setShowDelete}
      />
    </>
  )
}
