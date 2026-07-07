import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  generatePlayoffs,
  generateGroupMatches,
  generateSemifinals,
  generateFinals,
} from './actions';
import { Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateMatchDialog } from './create-match-dialog';
import { MatchActions } from './match-actions';
import { GenerateButton } from './generate-button';
import { formatTime } from '@/lib/utils';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zápasy',
};

export const revalidate = 0;

export default async function MatchesPage() {
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
      </div>
    );
  }

  const { data: tournamentTeams } = await supabase
    .from('teams')
    .select('*')
    .eq('tournament_id', activeTournament.id);

  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(id, name), away_team:teams!away_team_id(id, name)')
    .eq('tournament_id', activeTournament.id)
    .order('start_time', { ascending: true })
    .order('field', { ascending: true });

  const groupMatches = matches?.filter((m) => m.stage === 'group') || [];
  const playoffMatches = matches?.filter((m) => m.stage !== 'group') || [];

  const allGroupMatchesFinished =
    groupMatches.length > 0 && groupMatches.every((m) => m.status === 'finished');
  const playoffsGenerated = playoffMatches.length > 0;

  const qfMatches = matches?.filter((m) => m.stage === 'quarterfinal') || [];
  const smallSfMatches = matches?.filter((m) => m.stage === 'small_semifinal') || [];
  const allQfFinished = qfMatches.length === 4 && qfMatches.every((m) => m.status === 'finished');
  const allSmallSfFinished =
    smallSfMatches.length === 2 && smallSfMatches.every((m) => m.status === 'finished');
  const semifinalsGenerated = matches?.some((m) => m.stage === 'semifinal');

  const sfMatches = matches?.filter((m) => m.stage === 'semifinal') || [];
  const allSfFinished = sfMatches.length === 2 && sfMatches.every((m) => m.status === 'finished');

  const finalsGenerated = matches?.some((m) => m.stage === 'final');

  const readyForSemifinals = allQfFinished && allSmallSfFinished;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zápasy</h1>
        </div>

        <div className="flex gap-2">
          {groupMatches.length === 0 && (
            <GenerateButton
              action={generateGroupMatches}
              tournamentId={activeTournament.id}
              label="Generovat zápasy ve skupinách"
            />
          )}

          {allGroupMatchesFinished && !playoffsGenerated && (
            <GenerateButton
              action={generatePlayoffs}
              tournamentId={activeTournament.id}
              label="Generovat Play-off"
            />
          )}

          {readyForSemifinals && !semifinalsGenerated && (
            <GenerateButton
              action={generateSemifinals}
              tournamentId={activeTournament.id}
              label="Generovat Semifinále"
            />
          )}

          {allSfFinished && !finalsGenerated && (
            <GenerateButton
              action={generateFinals}
              tournamentId={activeTournament.id}
              label="Generovat Finále"
            />
          )}

          {matches && matches.length > 0 && (
            <CreateMatchDialog
              tournamentId={activeTournament.id}
              tournamentTeams={tournamentTeams || []}
              tournamentFieldsCount={activeTournament.number_of_fields || 1}
            />
          )}
        </div>
      </div>

      <div className="w-full rounded-md border overflow-hidden bg-card">
        {matches?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Trophy className="size-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">Nebyly vygenerovány žádné zápasy</h2>
            <p className="mt-2 text-center text-sm font-normal leading-tight text-muted-foreground max-w-sm mb-6">
              V tomto turnaji zatím nejsou žádné zápasy. Vytvořte zápas nebo vygenerujte zápasy ve
              skupinách.
            </p>
            <CreateMatchDialog
              tournamentId={activeTournament.id}
              tournamentTeams={tournamentTeams || []}
              tournamentFieldsCount={activeTournament.number_of_fields || 1}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Fáze</TableHead>
                <TableHead className="whitespace-nowrap">Čas</TableHead>
                <TableHead className="whitespace-nowrap">Hřiště</TableHead>
                <TableHead className="whitespace-nowrap">Domácí</TableHead>
                <TableHead className="whitespace-nowrap">Hosté</TableHead>
                <TableHead className="whitespace-nowrap">Stav</TableHead>
                <TableHead className="text-right whitespace-nowrap">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches?.map((match) => (
                <TableRow
                  key={match.id}
                  className="relative group hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <TableCell className="font-medium whitespace-nowrap">
                    <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
                      {match.stage.replace('_', ' ')}
                    </Badge>
                    <Link href={`/admin/matches/${match.id}`} className="absolute inset-0 z-0">
                      <span className="sr-only">Detail zápasu</span>
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium">
                    {formatTime(match.start_time)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {match.field ? (
                      <span className="font-medium">{match.field}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{match.home_team?.name}</TableCell>
                  <TableCell className="font-medium">{match.away_team?.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
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
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end relative z-10">
                      <MatchActions
                        match={match}
                        tournamentTeams={tournamentTeams || []}
                        tournamentFieldsCount={activeTournament.number_of_fields || 1}
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
