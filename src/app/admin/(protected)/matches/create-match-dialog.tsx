'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { createMatch } from './actions';
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

export function CreateMatchDialog({
  tournamentId,
  tournamentTeams,
  tournamentFieldsCount = 1,
}: {
  tournamentId: string;
  tournamentTeams: any[];
  tournamentFieldsCount?: number;
}) {
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
    try {
      await createMatch(formData);
      toast.success('Zápas byl úspěšně vytvořen');
      setOpen(false);
    } catch {
      toast.error('Při vytváření zápasu došlo k chybě');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Vytvořit zápas
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Vytvořit zápas</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4" key={open ? 'open' : 'closed'}>
          <input type="hidden" name="tournament_id" value={tournamentId} />

          <FieldGroup>
            <Field>
              <FieldLabel>Fáze</FieldLabel>
              <Select name="stage" defaultValue="group" required>
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
              <Input name="start_time" type="time" required />
            </Field>

            <Field>
              <FieldLabel>Hřiště</FieldLabel>
              <Select name="field" required>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte hřiště..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
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
              <FieldLabel>Domácí</FieldLabel>
              <Select name="home_team_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte domácí tým..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {tournamentTeams?.map((tt: any) => (
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
              <Select name="away_team_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte hostující tým..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {tournamentTeams?.map((tt: any) => (
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
            Vytvořit zápas
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
