'use client'

import { useState } from 'react'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { removeTeam } from './actions'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

export function DeleteTeamDialog({ team, asDropdownItem, open, onOpenChange }: { team: { id: string, name: string }, asDropdownItem?: boolean, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen

  async function action(formData: FormData) {
    try {
      await removeTeam(formData)
      toast.success('Team deleted successfully')
      setIsOpen(false)
    } catch {
      toast.error('Failed to delete team')
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <AlertDialogTrigger asChild>
          {asDropdownItem ? (
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} variant="destructive">
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive gap-2"
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          )}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black mb-2">Remove Team?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{team.name}</strong> from the tournament? This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={action} className="m-0">
            <input type="hidden" name="id" value={team.id} />
            <AlertDialogAction type="submit" variant="destructive" className="w-full sm:w-auto m-0">Remove Team</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
