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
      toast.success('Zápas byl úspěšně zahájen');
    });
  };

  const handleEnd = () => {
    startTransition(async () => {
      await updateMatchStatus(matchId, 'finished');
      toast.success('Zápas byl úspěšně ukončen');
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
        Zahájit zápas
      </Button>
    );
  }

  if (status === 'in_progress') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ukončit zápas
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold mb-2">Ukončit zápas?</AlertDialogTitle>
            <AlertDialogDescription>
              Opravdu chcete ukončit tento zápas? Konečné skóre bude uloženo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnd}>Ukončit zápas</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return null;
}
