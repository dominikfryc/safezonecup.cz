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
import { Plus } from 'lucide-react';
import { addScheduleItem } from './actions';
import { toast } from 'sonner';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function CreateScheduleDialog({ tournamentId }: { tournamentId: string }) {
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
    try {
      await addScheduleItem(formData);
      toast.success('Event created successfully');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to create event');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>
        <form action={action} key={open ? 'open' : 'closed'}>
          <input type="hidden" name="tournament_id" value={tournamentId} />

          <FieldGroup>
            <Field>
              <FieldLabel>Time</FieldLabel>
              <Input name="time" type="time" required />
            </Field>

            <Field>
              <FieldLabel>Event Description</FieldLabel>
              <Textarea
                name="event"
                placeholder="E.g. Lunch Break, Opening Ceremony..."
                required
                className="resize-none"
              />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full mt-4">
            Add event
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
