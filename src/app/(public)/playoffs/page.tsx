import { createClient } from '@/utils/supabase/server';
import PlayoffTree from '@/components/PlayoffTree';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Play-off',
};

export default async function PlayoffsPage() {
  const supabase = await createClient();
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_active', true)
    .limit(1);
  const activeTournament = tournaments?.[0];

  return (
    <div className="flex flex-col gap-6 pt-2">
      {activeTournament && (
        <>
          <div className="text-center py-4">
            <h1 className="text-3xl font-bold tracking-tight">Play-off</h1>
          </div>
          <PlayoffTree tournamentId={activeTournament.id} />
        </>
      )}
    </div>
  );
}
