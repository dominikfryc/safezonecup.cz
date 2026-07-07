import { createClient } from '@/utils/supabase/server';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateTournamentDialog } from './create-tournament-dialog';
import { TournamentActions } from './tournament-actions';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Turnaje',
};

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .order('name', { ascending: false });

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turnaje</h1>
        </div>
        <CreateTournamentDialog />
      </div>

      <div className="w-full rounded-md border overflow-hidden bg-card">
        {tournaments?.length === 0 ? (
          <p className="text-muted-foreground italic text-sm">Nebyly nalezeny žádné turnaje.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Název</TableHead>
                <TableHead className="whitespace-nowrap">Datum</TableHead>
                <TableHead className="whitespace-nowrap">Místo</TableHead>
                <TableHead className="whitespace-nowrap">Velikost</TableHead>
                <TableHead className="whitespace-nowrap">Stav</TableHead>
                <TableHead className="text-right whitespace-nowrap">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments?.map((tournament) => (
                <TableRow
                  key={tournament.id}
                  data-state={tournament.is_active ? 'selected' : undefined}
                >
                  <TableCell className="font-medium whitespace-nowrap">{tournament.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(tournament.date)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{tournament.location || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {tournament.number_of_teams} Týmů / {tournament.number_of_groups} Skupin /{' '}
                    {tournament.number_of_fields} Hřišť
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {tournament.is_active ? (
                      <Badge variant="default" className="gap-1 pointer-events-none">
                        <CheckCircle2 className="size-3" />
                        Aktivní
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 pointer-events-none">
                        Neaktivní
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end">
                      <TournamentActions tournament={tournament} />
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
