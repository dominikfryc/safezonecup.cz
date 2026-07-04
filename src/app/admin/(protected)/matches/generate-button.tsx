'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

export function GenerateButton({
  action,
  tournamentId,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  tournamentId: string;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleAction = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('tournament_id', tournamentId);
      try {
        await action(formData);
        const itemName = label.replace('Generate ', '');
        toast.success(`Úspěšně vygenerováno`);
      } catch (e: any) {
        const itemName = label.replace('Generate ', '').toLowerCase();
        toast.error(e.message || `Chyba při generování`);
      }
    });
  };

  return (
    <Button
      onClick={handleAction}
      variant="outline"
      className="font-bold flex items-center gap-2"
      disabled={isPending}
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
      {label}
    </Button>
  );
}
