import { createClient } from '@/utils/supabase/server'
import MatchesList from '@/components/MatchesList'
import { PublicTournamentHeader } from '@/components/PublicTournamentHeader'

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_active', true)
    .limit(1)
  const activeTournament = tournaments?.[0]

  return (
    <div>
      <PublicTournamentHeader tournament={activeTournament} />
      {activeTournament && (
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">All Matches</h2>
            <p className="text-muted-foreground">Full match schedule and results.</p>
          </div>
          <MatchesList tournamentId={activeTournament.id} />
        </section>
      )}
    </div>
  )
}
