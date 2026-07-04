import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, User, Trophy, Target } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const cookieStore = await cookies();
  const adminTournamentId = cookieStore.get('admin_tournament_id')?.value;

  let activeTournament = null;

  if (adminTournamentId) {
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', adminTournamentId)
      .single();
    activeTournament = data;
  }

  if (!activeTournament) {
    const { data } = await supabase.from('tournaments').select('*').eq('is_active', true).limit(1);
    activeTournament = data?.[0];
  }

  if (!activeTournament) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">No Active Tournament</h2>
        <p className="text-muted-foreground mb-6">
          Please create a tournament in the Tournaments tab.
        </p>
      </div>
    );
  }

  // Fetch Stats
  const { count: teamsCount } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', activeTournament.id);

  const { count: playersCount } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', activeTournament.id);

  const { data: matchesData } = await supabase
    .from('matches')
    .select('home_score, away_score')
    .eq('tournament_id', activeTournament.id);

  const matchesCount = matchesData?.length || 0;
  const goalsScored =
    matchesData?.reduce((acc, m) => acc + (m.home_score || 0) + (m.away_score || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamsCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playersCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchesCount}</div>
          </CardContent>
        </Card>

        <Card className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Scored</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goalsScored}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
