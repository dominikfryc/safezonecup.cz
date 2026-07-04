import { createClient } from '@/utils/supabase/server';
import StandingsTable from '@/components/StandingsTable';

export default async function GroupsPage() {
  const supabase = await createClient();
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_active', true)
    .limit(1);
  const activeTournament = tournaments?.[0];

  return (
    <div>
      {activeTournament && (
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Tabulky skupin</h2>
            <p className="text-muted-foreground">Aktuální body, skóre a postupující týmy.</p>
          </div>
          <StandingsTable tournamentId={activeTournament.id} />
        </section>
      )}
    </div>
  );
}
