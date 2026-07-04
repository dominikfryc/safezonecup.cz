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
import { Plus } from 'lucide-react';
import { addTeam } from './actions';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CreateTeamDialog({
  tournamentId,
  disabled,
  availableGroups,
  groupCounts,
  maxTeamsPerGroup,
}: {
  tournamentId: string;
  disabled: boolean;
  availableGroups: string[];
  groupCounts: Record<string, number>;
  maxTeamsPerGroup: number;
}) {
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
    try {
      await addTeam(formData);
      toast.success('Tým byl úspěšně přidán');
      setOpen(false);
    } catch {
      toast.error('Při přidávání týmu došlo k chybě');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={disabled}>
          <Plus className="size-4" />
          Přidat tým
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Přidat tým</DialogTitle>
        </DialogHeader>
        <form action={action} key={open ? 'open' : 'closed'}>
          <input type="hidden" name="tournament_id" value={tournamentId} />
          <FieldGroup className="mb-4 gap-4">
            <Field>
              <FieldLabel>Název týmu</FieldLabel>
              <Input name="name" required placeholder="e.g. FC Spartans" />
            </Field>
          </FieldGroup>
          <FieldGroup className="mb-8 gap-4">
            <Field>
              <FieldLabel>Skupina</FieldLabel>
              <Select name="group" defaultValue="Unassigned">
                <SelectTrigger>
                  <SelectValue placeholder="Nepřiřazeno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Unassigned">Nepřiřazeno</SelectItem>
                    {availableGroups.map((group) => {
                      const count = groupCounts[group] || 0;
                      const isFull = count >= maxTeamsPerGroup;
                      return (
                        <SelectItem key={group} value={group} disabled={isFull}>
                          Skupina {group}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <Button type="submit" className="w-full">
            Přidat tým
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
