'use client'

import { useState } from 'react'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { deleteMatch } from './actions'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

export function DeleteMatchDialog({ match, asDropdownItem, open, onOpenChange }: { match: any, asDropdownItem?: boolean, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen

  async function action(formData: FormData) {
    try {
      await deleteMatch(formData)
      toast.success('Match deleted successfully')
      setIsOpen(false)
    } catch {
      toast.error('Failed to delete match')
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
          <AlertDialogTitle className="text-2xl font-bold mb-2">Delete Match?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this match between <strong>{match.home_team?.name}</strong> and <strong>{match.away_team?.name}</strong>? This will also remove any goals associated with the match. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={action} className="m-0">
            <input type="hidden" name="id" value={match.id} />
            <AlertDialogAction type="submit" variant="destructive" className="w-full sm:w-auto m-0">Delete Match</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
