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
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Plus } from 'lucide-react';
import { addPlayer } from './actions';
import { toast } from 'sonner';

export function CreatePlayerDialog({
  teamId,
  tournamentId,
}: {
  teamId: string;
  tournamentId: string;
}) {
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
    try {
      await addPlayer(formData);
      toast.success('Hráč byl úspěšně přidán');
      setOpen(false);
    } catch {
      toast.error('Při přidávání hráče došlo k chybě');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Přidat hráče
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Přidat hráče</DialogTitle>
        </DialogHeader>
        <form action={action} key={open ? 'open' : 'closed'}>
          <input type="hidden" name="tournament_id" value={tournamentId} />
          <input type="hidden" name="team_id" value={teamId} />
          <FieldGroup className="mb-8 gap-4">
            <Field>
              <FieldLabel>Jméno hráče</FieldLabel>
              <Input name="name" required placeholder="např. Jan Novák" autoComplete="off" />
            </Field>
          </FieldGroup>
          <Button type="submit" className="w-full">
            Přidat hráče
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
