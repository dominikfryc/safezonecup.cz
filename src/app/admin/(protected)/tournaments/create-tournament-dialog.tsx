'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Plus } from 'lucide-react'
import { createTournament } from './actions'
import { toast } from 'sonner'

export function CreateTournamentDialog() {
  const [open, setOpen] = useState(false)

  async function action(formData: FormData) {
    try {
      await createTournament(formData)
      toast.success('Tournament created successfully')
      setOpen(false)
    } catch {
      toast.error('Failed to create tournament')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Create Tournament
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Create Tournament</DialogTitle>
        </DialogHeader>
        <form action={action}>
          <FieldGroup className="mb-4 gap-4">
            <Field>
              <FieldLabel>Year</FieldLabel>
              <Input name="year" type="number" required />
            </Field>
            <Field>
              <FieldLabel>Location</FieldLabel>
              <Input name="location" />
            </Field>
          </FieldGroup>
          <FieldGroup className="mb-8 gap-4">
            <Field>
              <FieldLabel>Number of Teams</FieldLabel>
              <Input name="number_of_teams" type="number" required min={2} />
            </Field>
            <Field>
              <FieldLabel>Number of Groups</FieldLabel>
              <Input name="number_of_groups" type="number" required min={1} />
            </Field>
          </FieldGroup>
          
          <Button type="submit" className="w-full">
            Create Tournament
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
