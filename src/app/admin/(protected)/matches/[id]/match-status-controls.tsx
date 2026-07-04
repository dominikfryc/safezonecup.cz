'use client';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { updateMatchStatus } from './match-status-actions';
import { useTransition } from 'react';
import { Loader2, Play, Check } from 'lucide-react';
import { toast } from 'sonner';

export function MatchStatusControls({ matchId, status }: { matchId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    startTransition(async () => {
      await updateMatchStatus(matchId, 'in_progress');
      toast.success('Match started successfully');
    });
  };

  const handleEnd = () => {
    startTransition(async () => {
      await updateMatchStatus(matchId, 'finished');
      toast.success('Match finished successfully');
    });
  };

  if (status === 'scheduled') {
    return (
      <Button onClick={handleStart} disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        Start Match
      </Button>
    );
  }

  if (status === 'in_progress') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            End Match
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold mb-2">End Match?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this match? The final score will be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnd}>End Match</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return null;
}
