'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { editTeam } from './actions'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Team } from '@/lib/types'

export function EditTeamDialog({ 
  team, 
  availableGroups, 
  groupCounts, 
  maxTeamsPerGroup,
  asDropdownItem,
  open,
  onOpenChange
}: { 
  team: Team, 
  availableGroups: string[], 
  groupCounts: Record<string, number>, 
  maxTeamsPerGroup: number,
  asDropdownItem?: boolean,
  open?: boolean,
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen

  async function action(formData: FormData) {
    try {
      await editTeam(formData)
      toast.success('Team updated successfully')
      setIsOpen(false)
    } catch {
      toast.error('Failed to update team')
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
              <Pencil className="size-3.5" />
              Edit
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Team</DialogTitle>
        </DialogHeader>
        <form action={action} className="text-left" key={isOpen ? 'open' : 'closed'}>
          <input type="hidden" name="id" value={team.id} />
          <FieldGroup className="mb-4 gap-4">
            <Field>
              <FieldLabel>Team Name</FieldLabel>
              <Input name="name" defaultValue={team.name} required />
            </Field>
          </FieldGroup>
          <FieldGroup className="mb-8 gap-4">
            <Field>
              <FieldLabel>Group</FieldLabel>
              <Select name="group" defaultValue={team.group || "Unassigned"}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                    {availableGroups.map(group => {
                      const count = groupCounts[group] || 0;
                      const isFull = count >= maxTeamsPerGroup && team.group !== group;
                      return (
                        <SelectItem key={group} value={group} disabled={isFull}>
                          Group {group}
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
