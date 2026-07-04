'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { updateMatch } from './actions';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function EditMatchDialog({
  match,
  tournamentTeams,
  tournamentFieldsCount = 1,
  open,
  onOpenChange,
}: {
  match: any;
  tournamentTeams: any[];
  tournamentFieldsCount?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  async function action(formData: FormData) {
    try {
      await updateMatch(formData);
      toast.success('Zápas byl úspěšně upraven');
      setIsOpen(false);
    } catch {
      toast.error('Při úpravě zápasu došlo k chybě');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upravit zápas</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4" key={isOpen ? 'open' : 'closed'}>
          <input type="hidden" name="id" value={match.id} />

          <FieldGroup>
            <Field>
              <FieldLabel>Fáze</FieldLabel>
              <Select name="stage" defaultValue={match.stage}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte fázi..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="group">Základní skupina</SelectItem>
                    <SelectItem value="quarterfinal">Čtvrtfinále</SelectItem>
                    <SelectItem value="semifinal">Semifinále</SelectItem>
                    <SelectItem value="small_semifinal">Malé semifinále</SelectItem>
                    <SelectItem value="11th_place">Zápas o 11. místo</SelectItem>
                    <SelectItem value="9th_place">Zápas o 9. místo</SelectItem>
                    <SelectItem value="7th_place">Zápas o 7. místo</SelectItem>
                    <SelectItem value="5th_place">Zápas o 5. místo</SelectItem>
                    <SelectItem value="small_final">Zápas o 3. místo</SelectItem>
                    <SelectItem value="final">Finále</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Čas začátku</FieldLabel>
              <Input
                name="start_time"
                type="time"
                defaultValue={match.start_time?.substring(0, 5)}
              />
            </Field>

            <Field>
              <FieldLabel>Hřiště</FieldLabel>
              <Select name="field" defaultValue={match.field || 'none'}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte hřiště..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">Žádné</SelectItem>
                    {Array.from({ length: tournamentFieldsCount }).map((_, i) => {
                      const letter = String.fromCharCode(65 + i);
                      return (
                        <SelectItem key={letter} value={letter}>
                          Hřiště {letter}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Stav</FieldLabel>
              <Select name="status" defaultValue={match.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte stav..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="scheduled">Naplánováno</SelectItem>
                    <SelectItem value="in_progress">Probíhá</SelectItem>
                    <SelectItem value="finished">Ukončeno</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Domácí</FieldLabel>
              <Select name="home_team_id" defaultValue={match.home_team_id} required>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte domácí tým..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {tournamentTeams?.map((tt) => (
                      <SelectItem key={tt.id} value={tt.id}>
                        {tt.name} {tt.group_name ? `(Skupina ${tt.group_name})` : ''}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Hosté</FieldLabel>
              <Select name="away_team_id" defaultValue={match.away_team_id} required>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte hostující tým..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {tournamentTeams?.map((tt) => (
                      <SelectItem key={tt.id} value={tt.id}>
                        {tt.name} {tt.group_name ? `(Skupina ${tt.group_name})` : ''}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full mt-2">
            Uložit změny
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
