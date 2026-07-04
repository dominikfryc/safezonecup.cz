'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { updateMatch } from './actions'
import { toast } from 'sonner'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function EditMatchDialog({ match, tournamentTeams, tournamentFieldsCount = 1, open, onOpenChange }: { match: any, tournamentTeams: any[], tournamentFieldsCount?: number, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen

  async function action(formData: FormData) {
    try {
      await updateMatch(formData)
      toast.success('Match updated successfully')
      setIsOpen(false)
    } catch {
      toast.error('Failed to update match')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Match</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4" key={isOpen ? "open" : "closed"}>
          <input type="hidden" name="id" value={match.id} />
          
          <FieldGroup>
            <Field>
              <FieldLabel>Stage</FieldLabel>
              <Select name="stage" defaultValue={match.stage}>
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
              <Input name="start_time" type="time" defaultValue={match.start_time?.substring(0, 5)} />
            </Field>

            <Field>
              <FieldLabel>Field</FieldLabel>
              <Select name="field" defaultValue={match.field || "none"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">None</SelectItem>
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
              <FieldLabel>Status</FieldLabel>
              <Select name="status" defaultValue={match.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="finished">Finished</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Home Team</FieldLabel>
              <Select name="home_team_id" defaultValue={match.home_team_id} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select home team..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {tournamentTeams?.map(tt => (
                      <SelectItem key={tt.id} value={tt.id}>{tt.name} {tt.group_name ? `(Group ${tt.group_name})` : ''}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Away Team</FieldLabel>
              <Select name="away_team_id" defaultValue={match.away_team_id} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select away team..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {tournamentTeams?.map(tt => (
                      <SelectItem key={tt.id} value={tt.id}>{tt.name} {tt.group_name ? `(Group ${tt.group_name})` : ''}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full mt-2">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
