'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Pencil } from 'lucide-react'
import { editTournament } from './actions'
import { Tournament } from '@/lib/types'
import { toast } from 'sonner'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

export function EditTournamentDialog({ tournament, asDropdownItem, open, onOpenChange }: { tournament: Tournament, asDropdownItem?: boolean, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen

  async function action(formData: FormData) {
    try {
      await editTournament(formData)
      toast.success('Tournament updated successfully')
      setIsOpen(false)
    } catch {
      toast.error('Failed to update tournament')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {asDropdownItem ? (
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
          ) : (
            <Button variant="outline" size="sm" className="gap-2">
              <Pencil className="size-3" />
              Edit
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Edit Tournament</DialogTitle>
        </DialogHeader>
        <form action={action} className="text-left">
          <input type="hidden" name="id" value={tournament.id} />
          <FieldGroup className="mb-4 gap-4">
            <Field>
              <FieldLabel>Year</FieldLabel>
              <Input name="year" type="number" required defaultValue={tournament.year} />
            </Field>
            <Field>
              <FieldLabel>Location</FieldLabel>
              <Input name="location" defaultValue={tournament.location || ''} />
            </Field>
          </FieldGroup>
          <FieldGroup className="mb-8 gap-4">
            <Field>
              <FieldLabel>Number of Teams</FieldLabel>
              <Input name="number_of_teams" type="number" required defaultValue={tournament.number_of_teams} min={2} />
            </Field>
            <Field>
              <FieldLabel>Number of Groups</FieldLabel>
              <Input name="number_of_groups" type="number" required defaultValue={tournament.number_of_groups} min={1} />
            </Field>
          </FieldGroup>
          
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
