"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { buttonVariants } from "@/components/ui/button"
import { EditPlayerDialog } from "./edit-player-dialog"
import { DeletePlayerDialog } from "./delete-player-dialog"

import { Player } from "@/lib/types"

export function PlayerActions({ 
  player, 
  teamId 
}: { 
  player: Player
  teamId: string
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

      <EditPlayerDialog 
        player={player}
        teamId={teamId}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
      <DeletePlayerDialog 
        player={player}
        teamId={teamId}
        open={showDelete}
        onOpenChange={setShowDelete}
      />
    </>
  )
}
