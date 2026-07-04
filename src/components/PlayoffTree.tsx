'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Match } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const MatchNode = ({ match, title }: { match?: Match; title?: string }) => (
  <Card className="w-64 overflow-hidden flex flex-col relative z-10 shadow-lg border-primary/20">
    {(title || match?.field) && (
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider bg-secondary px-3 py-1 text-muted-foreground">
        <span>{title}</span>
        {match?.field && <span>Hřiště {match.field}</span>}
      </div>
    )}
    {match ? (
      <CardContent className="p-0 flex flex-col">
        <div
          className={`flex justify-between items-center px-3 py-2 border-b border-border/50 ${match.status === 'finished' && match.home_score > match.away_score ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
        >
          {match.home_team_id ? (
            <Link href={`/teams/${match.home_team_id}`} className="truncate pr-2 hover:underline hover:text-primary transition-colors">
              {match.home_team?.name || 'TBD'}
            </Link>
          ) : (
            <span className="truncate pr-2">{match.home_team?.name || 'TBD'}</span>
          )}
          <span className="text-primary font-mono bg-secondary px-2 py-0.5 rounded">
            {match.home_score}
          </span>
        </div>
        <div
          className={`flex justify-between items-center px-3 py-2 ${match.status === 'finished' && match.away_score > match.home_score ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
        >
          {match.away_team_id ? (
            <Link href={`/teams/${match.away_team_id}`} className="truncate pr-2 hover:underline hover:text-primary transition-colors">
              {match.away_team?.name || 'TBD'}
            </Link>
          ) : (
            <span className="truncate pr-2">{match.away_team?.name || 'TBD'}</span>
          )}
          <span className="text-primary font-mono bg-secondary px-2 py-0.5 rounded">
            {match.away_score}
          </span>
        </div>
      </CardContent>
    ) : (
      <CardContent className="p-0 flex flex-col opacity-50">
        <div className="flex justify-between px-3 py-2 border-b border-border text-muted-foreground">
          <span>?</span>
          <span>-</span>
        </div>
        <div className="flex justify-between px-3 py-2 text-muted-foreground">
          <span>?</span>
          <span>-</span>
        </div>
      </CardContent>
    )}
  </Card>
);

export default function PlayoffTree({ tournamentId }: { tournamentId: string }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchMatches = async () => {
      const { data } = await supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(id, name), away_team:teams!away_team_id(id, name)')
        .eq('tournament_id', tournamentId)
        .neq('stage', 'group');

      if (data) setMatches(data as Match[]);
    };

    fetchMatches();

    const channel = supabase
      .channel('playoff-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          fetchMatches();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, supabase]);

  if (matches.length === 0) {
    return (
      <Card className="text-center py-16 bg-secondary/20 border-dashed">
        <p className="text-muted-foreground italic">
          Play-off ještě nebylo vygenerováno. Nejprve dokončete základní skupiny.
        </p>
      </Card>
    );
  }

  const getMatchesByStage = (stage: string) => matches.filter((m) => m.stage === stage);

  const quarterfinals = getMatchesByStage('quarterfinal');
  const semifinals = getMatchesByStage('semifinal');
  const final = getMatchesByStage('final');
  const smallSemis = getMatchesByStage('small_semifinal');
  const smallFinal = getMatchesByStage('small_final'); // 3rd place
  const fifthPlace = getMatchesByStage('5th_place');
  const seventhPlace = getMatchesByStage('7th_place');
  const ninthPlace = getMatchesByStage('9th_place');
  const eleventhPlace = getMatchesByStage('11th_place');

  return (
    <div className="flex flex-col overflow-x-auto pb-8">
      <div className="min-w-[800px]">
        <h3 className="text-2xl font-bold mb-12 flex items-center gap-3">
          <span className="w-3 h-8 bg-blue-500 rounded-full"></span>
          Pavouk play-off
        </h3>

        <div className="flex flex-col gap-8">
          {/* Top 8 Bracket */}
          <div className="flex gap-16 relative">
            {/* Quarterfinals */}
            <div className="flex flex-col gap-8 justify-center">
              {[0, 1, 2, 3].map((i) => (
                <div key={`qf-${i}`} className="relative">
                  <MatchNode match={quarterfinals[i]} title={`Čtvrtfinále ${i + 1}`} />
                  <div className="absolute top-1/2 -right-16 w-16 h-px bg-border"></div>
                  {i % 2 === 0 && (
                    <div className="absolute top-1/2 -right-16 w-px h-[calc(50%+2rem)] bg-border"></div>
                  )}
                  {i % 2 === 1 && (
                    <div className="absolute bottom-1/2 -right-16 w-px h-[calc(50%+2rem)] bg-border"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Semifinals */}
            <div className="flex flex-col gap-[10rem] justify-center relative left-16">
              {[0, 1].map((i) => (
                <div key={`sf-${i}`} className="relative">
                  <div className="absolute top-1/2 -left-16 w-16 h-px bg-border"></div>
                  <MatchNode match={semifinals[i]} title={`Semifinále ${i + 1}`} />
                  <div className="absolute top-1/2 -right-16 w-16 h-px bg-border"></div>
                  {i === 0 && (
                    <div className="absolute top-1/2 -right-16 w-px h-[calc(50%+5rem)] bg-border"></div>
                  )}
                  {i === 1 && (
                    <div className="absolute bottom-1/2 -right-16 w-px h-[calc(50%+5rem)] bg-border"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Final */}
            <div className="flex flex-col justify-center relative left-32">
              <div className="relative transform scale-110">
                <div className="absolute top-1/2 -left-16 w-16 h-px bg-border"></div>
                <MatchNode match={final[0]} title="Finále" />
              </div>
            </div>
          </div>

          {/* Bottom 4 Bracket */}
          <div className="flex gap-16 relative mt-16 pt-8 border-t border-border/50">
            {/* Small Semis */}
            <div className="flex flex-col gap-8 justify-center">
              <div className="absolute -left-2 -top-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                O 9.-12. místo
              </div>
              {[0, 1].map((i) => (
                <div key={`ssf-${i}`} className="relative">
                  <MatchNode match={smallSemis[i]} title={`Malé semifinále ${i + 1}`} />
                  <div className="absolute top-1/2 -right-16 w-16 h-px bg-border"></div>
                  {i === 0 && (
                    <div className="absolute top-1/2 -right-16 w-px h-[calc(50%+2rem)] bg-border"></div>
                  )}
                  {i === 1 && (
                    <div className="absolute bottom-1/2 -right-16 w-px h-[calc(50%+2rem)] bg-border"></div>
                  )}
                </div>
              ))}
            </div>

            {/* 9th Place Match */}
            <div className="flex flex-col justify-center relative left-16">
              <div className="relative">
                <div className="absolute top-1/2 -left-16 w-16 h-px bg-border"></div>
                <MatchNode match={ninthPlace[0]} title="Zápas o 9. místo" />
              </div>
            </div>
          </div>
        </div>

        {/* Unified Placement Matches */}
        {(smallFinal.length > 0 ||
          fifthPlace.length > 0 ||
          seventhPlace.length > 0 ||
          eleventhPlace.length > 0) && (
          <div className="mt-16 pt-8 border-t border-border">
            <h4 className="text-sm font-bold mb-6 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              Zápasy o umístění
            </h4>
            <div className="flex gap-6 flex-wrap">
              {smallFinal.length > 0 && (
                <MatchNode match={smallFinal[0]} title="Zápas o 3. místo" />
              )}
              {fifthPlace.length > 0 && (
                <MatchNode match={fifthPlace[0]} title="Zápas o 5. místo" />
              )}
              {seventhPlace.length > 0 && (
                <MatchNode match={seventhPlace[0]} title="Zápas o 7. místo" />
              )}
              {eleventhPlace.length > 0 && (
                <MatchNode match={eleventhPlace[0]} title="Zápas o 11. místo" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
