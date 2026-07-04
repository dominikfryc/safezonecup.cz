'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { editScheduleItem } from './actions';
import { toast } from 'sonner';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScheduleItem } from '@/lib/types';

export function EditScheduleDialog({
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
      await editScheduleItem(formData);
      toast.success('Událost byla úspěšně upravena');
      setIsOpen(false);
    } catch (error) {
      toast.error('Při úpravě události došlo k chybě');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit událost</DialogTitle>
        </DialogHeader>
        <form action={action} key={isOpen ? 'open' : 'closed'}>
          <input type="hidden" name="id" value={scheduleItem.id} />

          <FieldGroup>
            <Field>
              <FieldLabel>Čas</FieldLabel>
              <Input
                name="time"
                type="time"
                defaultValue={scheduleItem.time?.substring(0, 5)}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Popis události</FieldLabel>
              <Textarea
                name="event"
                defaultValue={scheduleItem.event}
                required
                className="resize-none"
              />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full mt-4">
            Uložit změny
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
