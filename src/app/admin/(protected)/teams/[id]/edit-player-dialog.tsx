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
import { editPlayer } from './actions';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

import { Player } from '@/lib/types';

export function EditPlayerDialog({
  player,
  teamId,
  asDropdownItem,
  open,
  onOpenChange,
}: {
  player: Player;
  teamId: string;
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
      await editPlayer(formData);
      toast.success('Hráč byl úspěšně upraven');
      setIsOpen(false);
    } catch {
      toast.error('Při úpravě hráče došlo k chybě');
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
              Upravit
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upravit hráče</DialogTitle>
        </DialogHeader>
        <form action={action} className="text-left" key={isOpen ? 'open' : 'closed'}>
          <input type="hidden" name="id" value={player.id} />
          <input type="hidden" name="team_id" value={teamId} />
          <FieldGroup className="mb-8 gap-4">
            <Field>
              <FieldLabel>Jméno hráče</FieldLabel>
              <Input name="name" defaultValue={player.name} required />
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
