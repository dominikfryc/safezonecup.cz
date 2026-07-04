'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { createMatch } from './actions'
import { toast } from 'sonner'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function CreateMatchDialog({ 
  tournamentId,
  tournamentTeams,
  tournamentFieldsCount = 1
}: { 
  tournamentId: string
  tournamentTeams: any[] 
  tournamentFieldsCount?: number
}) {
  const [open, setOpen] = useState(false)

  async function action(formData: FormData) {
    try {
      await createMatch(formData)
      toast.success('Match created successfully')
      setOpen(false)
    } catch {
      toast.error('Failed to create match')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Create match
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create match</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4" key={open ? "open" : "closed"}>
          <input type="hidden" name="tournament_id" value={tournamentId} />
          
          <FieldGroup>
            <Field>
              <FieldLabel>Stage</FieldLabel>
              <Select name="stage" defaultValue="group" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="group">Group Stage</SelectItem>
                    <SelectItem value="quarterfinal">Quarterfinal</SelectItem>
                    <SelectItem value="semifinal">Semifinal</SelectItem>
                    <SelectItem value="small_semifinal">Small Semifinal</SelectItem>
                    <SelectItem value="11th_place">11th Place Match</SelectItem>
                    <SelectItem value="9th_place">9th Place Match</SelectItem>
                    <SelectItem value="7th_place">7th Place Match</SelectItem>
                    <SelectItem value="5th_place">5th Place Match</SelectItem>
                    <SelectItem value="small_final">3rd Place Match</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Start Time</FieldLabel>
              <Input name="start_time" type="time" required />
            </Field>

            <Field>
              <FieldLabel>Field</FieldLabel>
              <Select name="field" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Array.from({ length: tournamentFieldsCount }).map((_, i) => {
                      const letter = String.fromCharCode(65 + i);
                      return (
                        <SelectItem key={letter} value={letter}>
                          Field {letter}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Home Team</FieldLabel>
              <Select name="home_team_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select home team..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {tournamentTeams?.map((tt: any) => (
                      <SelectItem key={tt.id} value={tt.id}>{tt.name} {tt.group_name ? `(Group ${tt.group_name})` : ''}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Away Team</FieldLabel>
              <Select name="away_team_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select away team..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {tournamentTeams?.map((tt: any) => (
                      <SelectItem key={tt.id} value={tt.id}>{tt.name} {tt.group_name ? `(Group ${tt.group_name})` : ''}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full mt-2">
            Create match
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
