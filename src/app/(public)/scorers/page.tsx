import { createClient } from '@/utils/supabase/server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Střelci',
};

export const revalidate = 0; // Ensures data is fresh

export default async function ScorersPage() {
  const supabase = await createClient();

  // Fetch players with their team info
  const { data: players } = await supabase
    .from('players')
    .select('*, team:teams(*)');

  // Fetch all goals
  const { data: goals } = await supabase
    .from('goals')
    .select('player_id');

  if (!players || !goals) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Nepodařilo se načíst data.</p>
      </div>
    );
  }

  // Count goals per player
  const goalCounts: Record<string, number> = {};
  goals.forEach((goal) => {
    if (goal.player_id) {
      goalCounts[goal.player_id] = (goalCounts[goal.player_id] || 0) + 1;
    }
  });

  // Filter players with at least one goal, map their goal count, and sort
  const scorers = players
    .map((player) => ({
      ...player,
      goals: goalCounts[player.id] || 0,
    }))
    .filter((player) => player.goals > 0)
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold tracking-tight">Střelci</h1>
      </div>

      <Card className="border-none shadow-none bg-card/50 backdrop-blur-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-16 text-center font-bold">Pořadí</TableHead>
                <TableHead className="font-bold">Hráč</TableHead>
                <TableHead className="font-bold">Tým</TableHead>
                <TableHead className="text-right font-bold pr-6">Góly</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scorers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Zatím nepadly žádné góly.
                  </TableCell>
                </TableRow>
              ) : (
                scorers.map((scorer, index) => (
                  <TableRow 
                    key={scorer.id}
                    className="group hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="py-2 text-center font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                      {index + 1}.
                    </TableCell>
                    <TableCell className="py-2 font-medium text-lg">
                      {scorer.name}
                    </TableCell>
                    <TableCell className="py-2 text-muted-foreground">
                      {scorer.team ? (
                        <Link href={`/teams/${scorer.team.id}`} className="hover:underline hover:text-primary transition-colors">
                          {scorer.team.name}
                        </Link>
                      ) : (
                        'Neznámý tým'
                      )}
                    </TableCell>
                    <TableCell className="py-2 text-right pr-6">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {scorer.goals}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
