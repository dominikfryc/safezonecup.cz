'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Plus } from 'lucide-react'
import { addPlayer } from './actions'
import { toast } from 'sonner'

export function CreatePlayerDialog({ teamId, tournamentId }: { teamId: string, tournamentId: string }) {
  const [open, setOpen] = useState(false)

  async function action(formData: FormData) {
    try {
      await addPlayer(formData)
      toast.success('Player added successfully')
      setOpen(false)
    } catch {
      toast.error('Failed to add player')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Player
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Add Player</DialogTitle>
        </DialogHeader>
        <form action={action}>
          <input type="hidden" name="tournament_id" value={tournamentId} />
          <input type="hidden" name="team_id" value={teamId} />
          <FieldGroup className="mb-8 gap-4">
            <Field>
              <FieldLabel>Player Name</FieldLabel>
              <Input 
                name="name" 
                required 
                placeholder="e.g. John Doe"
                autoComplete="off"
              />
            </Field>
          </FieldGroup>
          <Button type="submit" className="w-full">
            Add to Roster
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
