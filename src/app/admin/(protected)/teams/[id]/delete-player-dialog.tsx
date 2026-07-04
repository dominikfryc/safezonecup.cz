'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { removePlayer } from './actions';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function DeletePlayerDialog({
  player,
  teamId,
  asDropdownItem,
  open,
  onOpenChange,
}: {
  player: { id: string; name: string };
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
      await removePlayer(formData);
      toast.success('Hráč byl úspěšně odstraněn');
      setIsOpen(false);
    } catch {
      toast.error('Při odstraňování hráče došlo k chybě');
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <AlertDialogTrigger asChild>
          {asDropdownItem ? (
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} variant="destructive">
              <Trash2 className="mr-2 size-4" />
              Smazat
            </DropdownMenuItem>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive gap-2"
            >
              <Trash2 className="size-3.5" />
              Smazat
            </Button>
          )}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold mb-2">Odstranit hráče?</AlertDialogTitle>
          <AlertDialogDescription>
            Opravdu chcete odstranit hráče <strong>{player.name}</strong> ze soupisky? Tuto akci
            nelze vrátit.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Zrušit</AlertDialogCancel>
          <form action={action} className="m-0">
            <input type="hidden" name="id" value={player.id} />
            <input type="hidden" name="team_id" value={teamId} />
            <AlertDialogAction type="submit" variant="destructive" className="w-full sm:w-auto m-0">
              Odstranit hráče
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
