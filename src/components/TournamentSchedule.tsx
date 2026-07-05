import { ScheduleItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatTime } from '@/lib/utils';

export default function TournamentSchedule({ schedules }: { schedules: ScheduleItem[] }) {
  const sortedSchedules = [...schedules].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold">Harmonogram turnaje</h3>
      </div>

      <div className="flex flex-col gap-2">
        {sortedSchedules.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden bg-card shadow-none transition-all duration-300 border-border/50"
          >
            <CardContent className="py-2 px-3 flex items-center gap-4">
              <div className="font-mono font-bold text-sm bg-secondary px-3 py-1.5 rounded-md text-primary text-center min-w-[80px]">
                {formatTime(item.time)}
              </div>
              <div className="text-base font-medium text-foreground">{item.event}</div>
            </CardContent>
          </Card>
        ))}
        {sortedSchedules.length === 0 && (
          <div className="text-center py-12 bg-secondary/10 rounded-xl border border-dashed">
            <p className="text-muted-foreground">Zatím nejsou naplánovány žádné události.</p>
          </div>
        )}
      </div>
    </div>
  );
}
