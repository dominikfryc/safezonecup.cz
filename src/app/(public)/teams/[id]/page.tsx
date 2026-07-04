import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MatchCard } from '@/components/MatchCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const revalidate = 0;

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const { id: teamId } = await params;
  const supabase = await createClient();

  // 1. Fetch Team
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (!team) {
    notFound();
  }

  // 2. Fetch Players
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId);

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
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*), goals(*, players(*))')
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order('start_time', { ascending: false });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button variant="ghost" size="sm" className="mb-4 -ml-3" asChild>
          <Link href="/groups">
            <ArrowLeft className="mr-2 size-4" />
            Zpět na skupiny
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white text-2xl font-black">
              {team.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">{team.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="uppercase tracking-wider">
                  Skupina {team.group || '?'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar: Players */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-xl">
            <CardHeader className="bg-secondary/10 pb-4 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="w-5 h-5 text-primary" />
                Soupiska
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sortedPlayers.length > 0 ? (
                <ul className="divide-y divide-border/50">
                  {sortedPlayers.map((player) => (
                    <li key={player.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
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

        {/* Main: Matches */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Zápasy týmu</h2>
          </div>

          {matches && matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {matches.map((match) => (
                <div key={match.id}>
                  <MatchCard match={match} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-xl">
              <CardContent className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
                <Calendar className="w-12 h-12 mb-4 opacity-20" />
                <p>Tento tým zatím nemá žádné zápasy.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
