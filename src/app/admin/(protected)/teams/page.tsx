import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CreateTeamDialog } from './create-team-dialog';
import { TeamActions } from './team-actions';
import { calculateTeamStats, sortTeams } from '@/lib/standings';

export default async function TeamsPage() {
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
        <h2 className="text-2xl font-bold mb-2">Žádný aktivní turnaj</h2>
        <p className="text-muted-foreground mb-6">
          Nejprve prosím vytvořte nebo aktivujte turnaj na přehledu.
        </p>
        <Button asChild>
          <Link href="/admin">Zpět na přehled</Link>
        </Button>
      </div>
    );
  }

  // Get teams in this tournament
  const { data: teams } = await supabase
    .from('teams')
    .select('*, players(id)')
    .eq('tournament_id', activeTournament.id);

  // Get finished matches
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', activeTournament.id)
    .eq('status', 'finished');

  const teamIds = teams?.map((t) => t.id) || [];
  const stats = calculateTeamStats(matches || [], teamIds);

  const teamsWithStats = (teams || []).map((team) => {
    const teamStats = stats[team.id] || { pts: 0, gd: 0, gs: 0 };
    return {
      ...team,
      pts: teamStats.pts,
      gd: teamStats.gd,
      gs: teamStats.gs,
      points: teamStats.pts,
    };
  });

  const sortedTeams = sortTeams(teamsWithStats);

  const isMaxTeamsReached = sortedTeams.length >= activeTournament.number_of_teams;

  const maxTeamsPerGroup =
    Math.ceil(activeTournament.number_of_teams / activeTournament.number_of_groups) || 1;

  const groupCounts = sortedTeams.reduce(
    (acc, team) => {
      if (team.group) {
        acc[team.group] = (acc[team.group] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const availableGroups = Array.from({ length: activeTournament.number_of_groups }, (_, i) =>
    String(i + 1),
  );

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Týmy</h1>
        </div>

        {sortedTeams.length > 0 && !isMaxTeamsReached && (
          <CreateTeamDialog
            tournamentId={activeTournament.id}
            disabled={isMaxTeamsReached}
            availableGroups={availableGroups}
            groupCounts={groupCounts}
            maxTeamsPerGroup={maxTeamsPerGroup}
          />
        )}
      </div>

      <div className="w-full rounded-md border overflow-hidden bg-card">
        {sortedTeams.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Users className="size-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">Žádné registrované týmy</h2>
            <p className="mt-2 text-center text-sm font-normal leading-tight text-muted-foreground max-w-sm mb-6">
              Zatím jste do tohoto turnaje nepřidali žádné týmy. Přidejte týmy a začněte turnaj
              organizovat.
            </p>
            {!isMaxTeamsReached && (
              <CreateTeamDialog
                tournamentId={activeTournament.id}
                disabled={isMaxTeamsReached}
                availableGroups={availableGroups}
                groupCounts={groupCounts}
                maxTeamsPerGroup={maxTeamsPerGroup}
              />
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Tým</TableHead>
                <TableHead className="whitespace-nowrap">Skupina</TableHead>
                <TableHead className="whitespace-nowrap">Body</TableHead>
                <TableHead className="whitespace-nowrap">Hráči</TableHead>
                <TableHead className="text-right whitespace-nowrap">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTeams.map((team) => (
                <TableRow key={team.id} className="relative group">
                  <TableCell className="font-medium whitespace-nowrap">
                    {team.name}
                    <Link href={`/admin/teams/${team.id}`} className="absolute inset-0 z-0">
                      <span className="sr-only">Zobrazit {team.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {team.group ? (
                      <span className="font-medium">{team.group}</span>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Nepřiřazeno</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{team.points}</TableCell>
                  <TableCell className="font-medium whitespace-nowrap">
                    {team.players?.length || 0}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end relative z-10">
                      <TeamActions
                        team={team}
                        availableGroups={availableGroups}
                        groupCounts={groupCounts}
                        maxTeamsPerGroup={maxTeamsPerGroup}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
