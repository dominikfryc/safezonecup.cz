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
import { deleteMatch } from './actions';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function DeleteMatchDialog({
  match,
  asDropdownItem,
  open,
  onOpenChange,
}: {
  match: any;
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
      await deleteMatch(formData);
      toast.success('Zápas byl úspěšně smazán');
      setIsOpen(false);
    } catch {
      toast.error('Při mazání zápasu došlo k chybě');
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
          <AlertDialogTitle className="text-2xl font-bold mb-2">Smazat zápas?</AlertDialogTitle>
          <AlertDialogDescription>
            Opravdu chcete smazat tento zápas mezi <strong>{match.home_team?.name}</strong> a{' '}
            <strong>{match.away_team?.name}</strong>? Tímto se také odstraní všechny góly spojené s
            tímto zápasem. Tuto akci nelze vrátit.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Zrušit</AlertDialogCancel>
          <form action={action} className="m-0">
            <input type="hidden" name="id" value={match.id} />
            <AlertDialogAction type="submit" variant="destructive" className="w-full sm:w-auto m-0">
              Smazat zápas
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
