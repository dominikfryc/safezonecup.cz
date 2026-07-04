import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Goal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddGoalDialog } from './add-goal-dialog';
import { MatchStatusControls } from './match-status-controls';
import { GoalRowActions } from './goal-row-actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const { id: matchId } = await params;
  const supabase = await createClient();

  // 1. Fetch Match
  const { data: match } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .eq('id', matchId)
    .single();

  if (!match) {
    notFound();
  }

  // 2. Fetch Goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*, player:players!player_id(*), team:teams!team_id(*)')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  // 3. Fetch Players for both teams
  const { data: homePlayers } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', match.home_team_id);

  const { data: awayPlayers } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', match.away_team_id);

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <Button variant="ghost" size="sm" className="mb-4 -ml-3" asChild>
          <Link href="/admin/matches">
            <ArrowLeft className="mr-2 size-4" />
            Back to Matches
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Match Details</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
                {match.stage.replace('_', ' ')}
              </Badge>
              <Badge
                variant={
                  match.status === 'finished'
                    ? 'default'
                    : match.status === 'in_progress'
                      ? 'destructive'
                      : 'outline'
                }
                className={`text-[10px] ${match.status === 'in_progress' ? 'animate-pulse' : ''}`}
              >
                {match.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MatchStatusControls matchId={matchId} status={match.status} />
            {match.status === 'in_progress' && (
              <AddGoalDialog
                matchId={matchId}
                homeTeam={match.home_team}
                awayTeam={match.away_team}
                homePlayers={homePlayers || []}
                awayPlayers={awayPlayers || []}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-4">
        {/* Match Scoreboard */}
        <Card className="lg:col-span-3 rounded-md">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-3xl font-bold">{match.home_team?.name}</h2>
              </div>

              <div className="flex items-center justify-center gap-4 bg-muted/30 px-8 py-6 rounded-2xl">
                <div className="text-6xl font-black">{match.home_score}</div>
                <div className="text-4xl text-muted-foreground font-black">:</div>
                <div className="text-6xl font-black">{match.away_score}</div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold">{match.away_team?.name}</h2>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List Section */}
      <div className="flex flex-col gap-6 mt-4">
        <div className="w-full rounded-md border overflow-hidden bg-card">
          {goals?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in-50">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Goal className="size-10 text-muted-foreground" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">No goals yet</h2>
              <p className="mt-2 text-center text-sm font-normal leading-tight text-muted-foreground max-w-sm">
                Add the first goal of the match.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Player</TableHead>
                  <TableHead className="whitespace-nowrap">Team</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals?.map((goal: any) => {
                  const isHome = goal.team_id === match.home_team_id;
                  const players = isHome ? homePlayers : awayPlayers;

                  return (
                    <TableRow key={goal.id} className="relative group">
                      <TableCell className="font-medium whitespace-nowrap">
                        {goal.player?.name || 'Unknown Player'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {goal.team?.name}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end relative z-10">
                          <GoalRowActions goal={goal} matchId={matchId} players={players || []} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
