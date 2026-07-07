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
import { createTournament } from './actions';
import { toast } from 'sonner';

export function CreateTournamentDialog() {
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
    try {
      await createTournament(formData);
      toast.success('Turnaj byl úspěšně vytvořen');
      setOpen(false);
    } catch {
      toast.error('Při vytváření turnaje došlo k chybě');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Vytvořit turnaj
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Vytvořit turnaj</DialogTitle>
        </DialogHeader>
        <form action={action} key={open ? 'open' : 'closed'}>
          <FieldGroup className="mb-4 gap-4">
            <Field>
              <FieldLabel>Název</FieldLabel>
              <Input name="name" type="text" required />
            </Field>
            <Field>
              <FieldLabel>Datum</FieldLabel>
              <Input name="date" type="date" />
            </Field>
            <Field>
              <FieldLabel>Místo konání</FieldLabel>
              <Input name="location" />
            </Field>
          </FieldGroup>
          <FieldGroup className="mb-8 gap-4">
            <Field>
              <FieldLabel>Počet týmů</FieldLabel>
              <Input name="number_of_teams" type="number" required min={2} />
            </Field>
            <Field>
              <FieldLabel>Počet skupin</FieldLabel>
              <Input name="number_of_groups" type="number" required min={1} />
            </Field>
            <Field>
              <FieldLabel>Počet hřišť</FieldLabel>
              <Input name="number_of_fields" type="number" required min={1} />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full">
            Vytvořit turnaj
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
