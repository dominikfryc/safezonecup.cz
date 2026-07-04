import { Match } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { MatchCard } from './MatchCard';

export default function Schedule({ matches }: { matches: Match[] }) {
  const sortedMatches = [...matches].sort((a, b) => {
    const timeComparison = (a.start_time || '').localeCompare(b.start_time || '');
    if (timeComparison !== 0) return timeComparison;
    return (a.field || '').localeCompare(b.field || '');
  });

  const fields = Array.from(new Set(matches.map((m) => m.field).filter(Boolean)));
  const numFields = Math.max(1, fields.length);

  const getGridColsClass = (num: number) => {
    switch (num) {
      case 1:
        return 'lg:grid-cols-1';
      case 2:
        return 'lg:grid-cols-2';
      case 3:
        return 'lg:grid-cols-3';
      case 4:
        return 'lg:grid-cols-4';
      case 5:
        return 'lg:grid-cols-5';
      case 6:
        return 'lg:grid-cols-6';
      default:
        return 'lg:grid-cols-4';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="size-2.5 rounded-full bg-purple-500"></div>
        <h3 className="text-2xl font-bold">Rozpis zápasů</h3>
      </div>

      <div className={`grid gap-4 md:grid-cols-2 ${getGridColsClass(numFields)}`}>
        {sortedMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
        {sortedMatches.length === 0 && (
          <div className="text-center py-12 bg-secondary/10 rounded-xl border border-dashed col-span-full">
            <p className="text-muted-foreground">Zatím nejsou naplánovány žádné zápasy.</p>
          </div>
        )}
      </div>
    </div>
  );
}
