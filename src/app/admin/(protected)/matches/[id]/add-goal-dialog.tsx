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
import { Plus } from 'lucide-react';
import { addGoal } from './goal-actions';
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

export function AddGoalDialog({
  matchId,
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
}: {
  matchId: string;
  homeTeam: any;
  awayTeam: any;
  homePlayers: any[];
  awayPlayers: any[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const availablePlayers =
    selectedTeam === homeTeam.id ? homePlayers : selectedTeam === awayTeam.id ? awayPlayers : [];

  async function action(formData: FormData) {
    try {
      await addGoal(formData);
      toast.success('Goal added successfully');
      setOpen(false);
    } catch {
      toast.error('Failed to add goal');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Goal</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4" key={open ? 'open' : 'closed'}>
          <input type="hidden" name="match_id" value={matchId} />

          <FieldGroup>
            <Field>
              <FieldLabel>Team</FieldLabel>
              <Select name="team_id" required value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={homeTeam.id}>{homeTeam.name}</SelectItem>
                    <SelectItem value={awayTeam.id}>{awayTeam.name}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Player</FieldLabel>
              <Select name="player_id" required disabled={!selectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select player..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availablePlayers?.map((p: any) => (
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
            Add Goal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
