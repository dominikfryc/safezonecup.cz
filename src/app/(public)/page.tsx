import { createClient } from '@/utils/supabase/server';
import HomeOverview from '@/components/HomeOverview';
import { PublicTournamentHeader } from '@/components/PublicTournamentHeader';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_active', true)
    .limit(1);
  const activeTournament = tournaments?.[0];

  return (
    <div className="flex flex-col gap-6 pt-2">
      <PublicTournamentHeader tournament={activeTournament} />
      {activeTournament && (
        <section>
          <HomeOverview tournamentId={activeTournament.id} tournamentDate={activeTournament.date} />
        </section>
      )}
    </div>
  );
}
