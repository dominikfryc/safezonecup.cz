'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Match, ScheduleItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/utils';
import TournamentResults from './TournamentResults';
import TournamentSchedule from './TournamentSchedule';
import { MatchCard } from './MatchCard';

export default function HomeOverview({ tournamentId }: { tournamentId: string }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: matchesData } = await supabase
        .from('matches')
        .select(
          `
          *,
          home_team:teams!home_team_id(id, name),
          away_team:teams!away_team_id(id, name),
          goals(id, team_id, players(id, name))
        `,
        )
        .eq('tournament_id', tournamentId)
        .order('start_time', { ascending: true });

      if (matchesData) {
        setMatches(matchesData as Match[]);
      }

      const { data: schedulesData } = await supabase
        .from('schedules')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('time', { ascending: true });

      if (schedulesData) {
        setSchedules(schedulesData as ScheduleItem[]);
      }

      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel('schema-db-changes-home')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => fetchData(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => fetchData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, supabase]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">
        Načítám přehled...
      </div>
    );
  }

  const fields = Array.from(new Set(matches.map((m) => m.field).filter(Boolean))).sort();

  const getActiveMatchForField = (fieldMatches: Match[]) => {
    if (fieldMatches.length === 0) return null;

    const sortedMatches = [...fieldMatches].sort((a, b) =>
      (a.start_time || '').localeCompare(b.start_time || ''),
    );

    for (const match of sortedMatches) {
      if (!match.start_time) continue;
      const [h, m] = match.start_time.split(':').map(Number);
      const startMinutes = h * 60 + m;
      const duration = match.stage === 'group' ? 20 : 30;

      if (currentTime >= startMinutes && currentTime < startMinutes + duration) {
        return { match, state: 'playing' as const };
      }
    }

    const upcomingMatch = sortedMatches.find((match) => {
      if (!match.start_time) return false;
      const [h, m] = match.start_time.split(':').map(Number);
      const startMinutes = h * 60 + m;
      return startMinutes > currentTime;
    });

    if (upcomingMatch) {
      return { match: upcomingMatch, state: 'upcoming' as const };
    }

    return {
      match: sortedMatches[sortedMatches.length - 1],
      state: 'finished' as const,
    };
  };

  return (
    <div className="flex flex-col gap-16">
      <TournamentResults matches={matches} hidePodium={true} />

      {/* Field Overview */}
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold">Aktuální zápasy</h3>
        </div>

        {fields.length === 0 ? (
          <Card className="p-8 text-center bg-card shadow-none border-dashed">
            <p className="text-muted-foreground">Na hřištích nejsou naplánovány žádné zápasy.</p>
          </Card>
        ) : (
          <div
            className="grid gap-8"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`,
            }}
          >
            {fields.map((field) => {
              const fieldMatches = matches.filter((m) => m.field === field);
              const activeMatchInfo = getActiveMatchForField(fieldMatches);

              if (!activeMatchInfo) return null;

              return (
                <div key={field} className="flex flex-col gap-4">
                  <MatchCard match={activeMatchInfo.match} state={activeMatchInfo.state} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TournamentSchedule schedules={schedules} />
    </div>
  );
}
