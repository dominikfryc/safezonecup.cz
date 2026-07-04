'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { updateGoal, deleteGoal } from './goal-actions';
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

export function GoalRowActions({
  goal,
  matchId,
  players,
}: {
  goal: any;
  matchId: string;
  players: any[];
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  async function handleUpdate(formData: FormData) {
    try {
      await updateGoal(formData);
      toast.success('Gól byl upraven');
      setShowEdit(false);
    } catch {
      toast.error('Při úpravě gólu došlo k chybě');
    }
  }

  async function handleDelete(formData: FormData) {
    try {
      await deleteGoal(formData);
      toast.success('Gól byl smazán');
      setShowDelete(false);
    } catch {
      toast.error('Při mazání gólu došlo k chybě');
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Otevřít menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onSelect={() => setShowEdit(true)}>
            <Pencil className="mr-2 size-4" />
            Upravit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowDelete(true)} variant="destructive">
            <Trash2 className="mr-2 size-4" />
            Smazat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Upravit gól</DialogTitle>
          </DialogHeader>
          <form
            action={handleUpdate}
            className="flex flex-col gap-4"
            key={showEdit ? 'open' : 'closed'}
          >
            <input type="hidden" name="goal_id" value={goal.id} />
            <input type="hidden" name="match_id" value={matchId} />

            <FieldGroup>
              <Field>
                <FieldLabel>Hráč</FieldLabel>
                <Select name="player_id" defaultValue={goal.player_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte hráče..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {players?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
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

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold mb-2">Smazat gól?</AlertDialogTitle>
            <AlertDialogDescription>
              Opravdu chcete smazat tento gól? Tuto akci nelze vrátit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <form action={handleDelete} className="m-0">
              <input type="hidden" name="goal_id" value={goal.id} />
              <input type="hidden" name="match_id" value={matchId} />
              <AlertDialogAction
                type="submit"
                variant="destructive"
                className="w-full sm:w-auto m-0"
              >
                Smazat gól
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
