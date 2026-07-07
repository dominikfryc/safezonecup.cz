import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { MatchCard } from '@/components/MatchCard';
import { Card, CardContent } from '@/components/ui/card';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: team } = await supabase
    .from('teams')
    .select('name')
    .eq('id', resolvedParams.id)
    .single();

  return {
    title: team?.name || 'Tým',
  };
}

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const { id: teamId } = await params;
  const supabase = await createClient();

  // 1. Fetch Team
  const { data: team } = await supabase.from('teams').select('*').eq('id', teamId).single();

  if (!team) {
    notFound();
  }

  // 2. Fetch Players
  const { data: players } = await supabase.from('players').select('*').eq('team_id', teamId);

  // 2.5 Fetch Team Goals
  const { data: teamGoals } = await supabase
    .from('goals')
    .select('player_id')
    .eq('team_id', teamId);

  const goalCounts: Record<string, number> = {};
  teamGoals?.forEach((goal) => {
    if (goal.player_id) {
      goalCounts[goal.player_id] = (goalCounts[goal.player_id] || 0) + 1;
    }
  });

  const sortedPlayers = (players || [])
    .map((player) => ({
      ...player,
      goals: goalCounts[player.id] || 0,
    }))
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));

  // 3. Fetch Matches
  const { data: matches } = await supabase
    .from('matches')
    .select(
      '*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*), goals(*, players(*))',
    )
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order('start_time', { ascending: false });

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="uppercase tracking-wider">
            Skupina {team.group || '?'}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Main: Matches */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-2">
            <h2 className="text-2xl font-bold">Zápasy týmu</h2>
          </div>

          {matches && matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match) => (
                <div key={match.id}>
                  <MatchCard match={match} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-none bg-card/50 backdrop-blur-xl">
              <CardContent className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
                <p>Tento tým zatím nemá žádné zápasy.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Players */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-2">
            <h2 className="text-2xl font-bold">Soupiska</h2>
          </div>

          <Card className="border-none shadow-none bg-card/50 backdrop-blur-xl">
            <CardContent className="p-0">
              {sortedPlayers.length > 0 ? (
                <ul className="divide-y divide-border/50">
                  {sortedPlayers.map((player) => (
                    <li
                      key={player.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">{player.name}</span>
                      {player.goals > 0 && (
                        <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                          {player.goals} ⚽
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Soupiska zatím není k dispozici.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
