import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CreateScheduleDialog } from './create-schedule-dialog';
import { ScheduleActions } from './schedule-actions';
import { formatTime } from '@/lib/utils';
import { ScheduleItem } from '@/lib/types';

export default async function SchedulePage() {
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

  // Get schedule items in this tournament
  const { data: schedules } = await supabase
    .from('schedules')
    .select('*')
    .eq('tournament_id', activeTournament.id)
    .order('time', { ascending: true });

  const typedSchedules = (schedules || []) as ScheduleItem[];

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Harmonogram</h1>
        </div>

        {typedSchedules.length > 0 && <CreateScheduleDialog tournamentId={activeTournament.id} />}
      </div>

      <div className="w-full rounded-md border overflow-hidden bg-card">
        {typedSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Calendar className="size-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">Žádné naplánované události</h2>
            <p className="mt-2 text-center text-sm font-normal leading-tight text-muted-foreground max-w-sm mb-6">
              Do tohoto turnaje jste ještě nepřidali žádné události. Přidejte je pro vytvoření
              harmonogramu.
            </p>
            <CreateScheduleDialog tournamentId={activeTournament.id} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Čas</TableHead>
                <TableHead>Událost</TableHead>
                <TableHead className="text-right w-[100px]">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typedSchedules.map((item) => (
                <TableRow key={item.id} className="relative group">
                  <TableCell className="font-medium whitespace-nowrap">
                    {formatTime(item.time)}
                  </TableCell>
                  <TableCell className="font-medium">{item.event}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end relative z-10">
                      <ScheduleActions scheduleItem={item} />
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
