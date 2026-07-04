'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { sortTeams } from '@/lib/standings';

type TeamStats = {
  id: string;
  name: string;
  group: string;
  played: number;
  w: number;
  d: number;
  l: number;
  gs: number;
  gc: number;
  gd: number;
  pts: number;
};

export default function StandingsTable({ tournamentId }: { tournamentId: string }) {
  const [standings, setStandings] = useState<TeamStats[]>([]);
  const [tournamentGroupsCount, setTournamentGroupsCount] = useState<number>(3);
  const supabase = createClient();

  useEffect(() => {
    const fetchStandings = async () => {
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('number_of_groups')
        .eq('id', tournamentId)
        .single();

      // Fetch teams and their groups
      const { data: teams } = await supabase
        .from('teams')
        .select('id, name, group')
        .eq('tournament_id', tournamentId);

      // Fetch group matches
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('stage', 'group')
        .eq('status', 'finished');

      if (!teams) return;

      const stats = teams.reduce(
        (
          acc: Record<string, TeamStats>,
          team: { id: string; name: string; group: string | null },
        ) => {
          acc[team.id] = {
            id: team.id,
            name: team.name,
            group: team.group || 'Nepřiřazeno',
            played: 0,
            w: 0,
            d: 0,
            l: 0,
            gs: 0,
            gc: 0,
            gd: 0,
            pts: 0,
          };
          return acc;
        },
        {},
      );

      matches?.forEach((m) => {
        const home = stats[m.home_team_id];
        const away = stats[m.away_team_id];

        if (!home || !away) return;

        home.played++;
        away.played++;
        home.gs += m.home_score;
        away.gs += m.away_score;
        home.gc += m.away_score;
        away.gc += m.home_score;
        home.gd = home.gs - home.gc;
        away.gd = away.gs - away.gc;

        if (m.home_score > m.away_score) {
          home.w++;
          home.pts += 3;
          away.l++;
        } else if (m.home_score < m.away_score) {
          away.w++;
          away.pts += 3;
          home.l++;
        } else {
          home.d++;
          home.pts += 1;
          away.d++;
          away.pts += 1;
        }
      });

      const sorted = sortTeams(Object.values(stats));

      setStandings(sorted);
      if (tournament) {
        setTournamentGroupsCount(tournament.number_of_groups);
      }
    };

    fetchStandings();

    const channel = supabase
      .channel('standings-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          fetchStandings();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          fetchStandings();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, supabase]);

  // Group the standings by group_name for display
  const availableGroups = Array.from({ length: tournamentGroupsCount }, (_, i) => String(i + 1));

  const groups = availableGroups.reduce((acc: Record<string, TeamStats[]>, groupName) => {
    acc[groupName] = standings.filter((s) => s.group === groupName);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {availableGroups.map((groupName) => (
          <Card
            key={groupName}
            className="overflow-hidden shadow-xl border-t-4 border-t-primary/50"
          >
            <CardHeader className="bg-secondary/20 pb-4">
              <CardTitle>Skupina {groupName}</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader className="bg-secondary/10">
                <TableRow>
                  <TableHead className="w-[50%]">Tým</TableHead>
                  <TableHead className="text-center">Z</TableHead>
                  <TableHead className="text-center">+/-</TableHead>
                  <TableHead className="text-right text-primary font-bold">B</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups[groupName]?.map((team: TeamStats, index: number) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-3">{index + 1}</span>
                      <Link href={`/teams/${team.id}`} className="hover:underline hover:text-primary transition-colors">
                        {team.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {team.played}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {team.gd > 0 ? `+${team.gd}` : team.gd}
                    </TableCell>
                    <TableCell className="text-right font-bold">{team.pts}</TableCell>
                  </TableRow>
                ))}
                {groups[groupName]?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Žádné týmy
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden shadow-xl bg-linear-to-br from-background to-secondary/10 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between bg-secondary/20 pb-4">
          <CardTitle className="text-lg">Celková tabulka (Kvalifikace do Play-off)</CardTitle>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Prvních 8 postupuje do velkého Play-off
          </p>
        </CardHeader>
        <Table>
          <TableHeader className="bg-secondary/10">
            <TableRow>
              <TableHead className="w-25">Poř.</TableHead>
              <TableHead>Tým</TableHead>
              <TableHead className="text-center">Z</TableHead>
              <TableHead className="text-center hidden sm:table-cell">V</TableHead>
              <TableHead className="text-center hidden sm:table-cell">R</TableHead>
              <TableHead className="text-center hidden sm:table-cell">P</TableHead>
              <TableHead className="text-center hidden md:table-cell">Skóre</TableHead>
              <TableHead className="text-center">+/-</TableHead>
              <TableHead className="text-right text-primary font-bold">B</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((team: TeamStats, index: number) => (
              <TableRow
                key={team.id}
                className={`
                  ${index < 8 ? 'bg-blue-500/5' : index < 12 ? 'bg-purple-500/5' : 'opacity-50'}
                `}
              >
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={`font-bold ${index < 8 ? 'text-blue-500' : index < 12 ? 'text-purple-500' : 'text-muted-foreground'}`}
                    >
                      #{index + 1}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase leading-none">
                      {index < 8 ? 'Velké' : index < 12 ? 'Malé' : 'Konec'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-bold">
                  <Link href={`/teams/${team.id}`} className="hover:underline hover:text-primary transition-colors">
                    {team.name}
                  </Link>
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    (Sk. {team.group})
                  </span>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">{team.played}</TableCell>
                <TableCell className="text-center text-muted-foreground hidden sm:table-cell">
                  {team.w}
                </TableCell>
                <TableCell className="text-center text-muted-foreground hidden sm:table-cell">
                  {team.d}
                </TableCell>
                <TableCell className="text-center text-muted-foreground hidden sm:table-cell">
                  {team.l}
                </TableCell>
                <TableCell className="text-center text-muted-foreground hidden md:table-cell">
                  {team.gs}:{team.gc}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {team.gd > 0 ? `+${team.gd}` : team.gd}
                </TableCell>
                <TableCell className="text-right font-black text-lg">{team.pts}</TableCell>
              </TableRow>
            ))}
            {standings.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  Tabulka se zobrazí po rozlosování týmů.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
