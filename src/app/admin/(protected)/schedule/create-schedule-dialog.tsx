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
import { addScheduleItem } from './actions';
import { toast } from 'sonner';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function CreateScheduleDialog({ tournamentId }: { tournamentId: string }) {
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
    try {
      await addScheduleItem(formData);
      toast.success('Událost byla úspěšně vytvořena');
      setOpen(false);
    } catch (error) {
      toast.error('Při vytváření události došlo k chybě');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Přidat událost
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Přidat událost</DialogTitle>
        </DialogHeader>
        <form action={action} key={open ? 'open' : 'closed'}>
          <input type="hidden" name="tournament_id" value={tournamentId} />

          <FieldGroup>
            <Field>
              <FieldLabel>Čas</FieldLabel>
              <Input name="time" type="time" required />
            </Field>

            <Field>
              <FieldLabel>Popis události</FieldLabel>
              <Textarea
                name="event"
                placeholder="Např. Oběd, Slavnostní zahájení..."
                required
                className="resize-none"
              />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full mt-4">
            Přidat událost
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
