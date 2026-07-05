import { createClient } from '@/utils/supabase/server';
import MatchesList from '@/components/MatchesList';

export default async function MatchesPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Zápasy</h1>
          </div>
          <MatchesList tournamentId={activeTournament.id} />
        </>
      )}
    </div>
  );
}
