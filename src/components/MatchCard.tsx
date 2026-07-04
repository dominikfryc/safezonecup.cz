import { Match } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTime } from '@/lib/utils'

export function MatchCard({ match, state }: { match: Match, state?: 'playing' | 'upcoming' | 'finished' }) {
  const homeName = match.home_team?.name || 'TBD'
  const awayName = match.away_team?.name || 'TBD'
  const isFinished = match.status === 'finished'

  const homeGoals = (match.goals || []).filter(g => g.team_id === match.home_team_id);
  const awayGoals = (match.goals || []).filter(g => g.team_id === match.away_team_id);

  const groupGoals = (goals: any[]) => {
    const counts: Record<string, number> = {};
    goals.forEach(g => {
      const name = g.players?.name || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }

  const homeScorers = groupGoals(homeGoals);
  const awayScorers = groupGoals(awayGoals);
  
  const matchState = state || (match.status === 'in_progress' ? 'playing' : match.status === 'scheduled' ? 'upcoming' : 'finished');
  
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 h-full ${isFinished ? 'bg-secondary/20' : 'bg-card shadow-sm hover:shadow-md'}`}>
      {matchState === 'playing' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      )}
      
      <CardContent className="p-0">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-3 border-border/50">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">{match.start_time ? formatTime(match.start_time) : 'TBD'}</Badge>
              <span className="text-sm font-medium text-muted-foreground">Field {match.field || '?'}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider hidden sm:inline-block">
                • {match.stage === 'group' ? 'Group Stage' : match.stage.replace('_', ' ')}
              </span>
            </div>
            <div>
              {matchState === 'playing' && <Badge variant="destructive" className="animate-pulse">LIVE</Badge>}
              {matchState === 'upcoming' && <Badge variant="outline" className="text-muted-foreground">UPCOMING</Badge>}
              {matchState === 'finished' && <Badge variant="secondary">FINISHED</Badge>}
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className={`flex-1 text-right font-bold text-lg leading-tight ${isFinished && match.home_score < match.away_score ? 'text-muted-foreground' : 'text-foreground'}`}>
              {homeName}
            </div>
            <div className="px-4 sm:px-6 flex items-center justify-center min-w-[90px] sm:min-w-[100px]">
              {matchState === 'upcoming' ? (
                <span className="text-muted-foreground text-sm font-bold">VS</span>
              ) : (
                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-md">
                  <span className={`text-2xl font-black ${isFinished ? 'text-foreground' : 'text-primary'}`}>{match.home_score}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className={`text-2xl font-black ${isFinished ? 'text-foreground' : 'text-primary'}`}>{match.away_score}</span>
                </div>
              )}
            </div>
            <div className={`flex-1 text-left font-bold text-lg leading-tight ${isFinished && match.away_score < match.home_score ? 'text-muted-foreground' : 'text-foreground'}`}>
              {awayName}
            </div>
          </div>

          {(homeScorers.length > 0 || awayScorers.length > 0) && (
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground pt-3 border-t border-border/50">
              <div className="flex-1 text-right flex flex-col gap-1">
                {homeScorers.map(s => (
                  <div key={s.name}>
                    {s.name} {'⚽'.repeat(s.count)}
                  </div>
                ))}
              </div>
              <div className="min-w-[90px] sm:min-w-[100px]"></div>
              <div className="flex-1 text-left flex flex-col gap-1">
                {awayScorers.map(s => (
                  <div key={s.name}>
                    {'⚽'.repeat(s.count)} {s.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
