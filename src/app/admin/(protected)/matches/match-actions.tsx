'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { buttonVariants } from '@/components/ui/button';
import { EditMatchDialog } from './edit-match-dialog';
import { DeleteMatchDialog } from './delete-match-dialog';

export function MatchActions({
  match,
  tournamentTeams,
  tournamentFieldsCount = 1,
}: {
  match: any;
  tournamentTeams: any[];
  tournamentFieldsCount?: number;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

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

      <EditMatchDialog
        match={match}
        tournamentTeams={tournamentTeams}
        tournamentFieldsCount={tournamentFieldsCount}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
      <DeleteMatchDialog match={match} open={showDelete} onOpenChange={setShowDelete} />
    </>
  );
}
