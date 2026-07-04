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
import { Pencil } from 'lucide-react';
import { editTournament } from './actions';
import { Tournament } from '@/lib/types';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function EditTournamentDialog({
  tournament,
  asDropdownItem,
  open,
  onOpenChange,
}: {
  tournament: Tournament;
  asDropdownItem?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  async function action(formData: FormData) {
    try {
      await editTournament(formData);
      toast.success('Turnaj byl úspěšně upraven');
      setIsOpen(false);
    } catch {
      toast.error('Při úpravě turnaje došlo k chybě');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {asDropdownItem ? (
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="mr-2 size-4" />
              Upravit
            </DropdownMenuItem>
          ) : (
            <Button variant="outline" size="sm" className="gap-2">
              <Pencil className="size-3" />
              Upravit
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upravit turnaj</DialogTitle>
        </DialogHeader>
        <form action={action} className="text-left" key={isOpen ? 'open' : 'closed'}>
          <input type="hidden" name="id" value={tournament.id} />
          <FieldGroup className="mb-4 gap-4">
            <Field>
              <FieldLabel>Název</FieldLabel>
              <Input name="name" type="text" required defaultValue={tournament.name} />
            </Field>
            <Field>
              <FieldLabel>Místo konání</FieldLabel>
              <Input name="location" defaultValue={tournament.location || ''} />
            </Field>
          </FieldGroup>
          <FieldGroup className="mb-8 gap-4">
            <Field>
              <FieldLabel>Počet týmů</FieldLabel>
              <Input
                name="number_of_teams"
                type="number"
                required
                defaultValue={tournament.number_of_teams}
                min={2}
              />
            </Field>
            <Field>
              <FieldLabel>Počet skupin</FieldLabel>
              <Input
                name="number_of_groups"
                type="number"
                required
                defaultValue={tournament.number_of_groups}
                min={1}
              />
            </Field>
            <Field>
              <FieldLabel>Počet hřišť</FieldLabel>
              <Input
                name="number_of_fields"
                type="number"
                required
                defaultValue={tournament.number_of_fields}
                min={1}
              />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full">
            Uložit změny
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
