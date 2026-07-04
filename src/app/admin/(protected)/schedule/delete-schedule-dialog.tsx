'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { removeScheduleItem } from './actions';
import { toast } from 'sonner';
import { ScheduleItem } from '@/lib/types';
import { formatTime } from '@/lib/utils';

export function DeleteScheduleDialog({
  scheduleItem,
  open,
  onOpenChange,
}: {
  scheduleItem: ScheduleItem;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  async function action(formData: FormData) {
    try {
      await removeScheduleItem(formData);
      toast.success('Event removed successfully');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to remove event');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the event "{scheduleItem.event}" scheduled at{' '}
            {formatTime(scheduleItem.time)}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <input type="hidden" name="id" value={scheduleItem.id} />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Delete
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
