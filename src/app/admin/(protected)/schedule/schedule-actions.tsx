'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { buttonVariants } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { ScheduleItem } from '@/lib/types';
import { EditScheduleDialog } from './edit-schedule-dialog';
import { DeleteScheduleDialog } from './delete-schedule-dialog';

export function ScheduleActions({ scheduleItem }: { scheduleItem: ScheduleItem }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Otevřít menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="mr-2 size-4" />
            Upravit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDeleteOpen(true)} variant="destructive">
            <Trash2 className="mr-2 size-4" />
            Smazat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditScheduleDialog scheduleItem={scheduleItem} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteScheduleDialog
        scheduleItem={scheduleItem}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
