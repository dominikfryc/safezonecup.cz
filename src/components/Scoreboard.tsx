'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Match } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTime } from '@/lib/utils'
import TournamentResults from './TournamentResults'

export default function Scoreboard({ tournamentId }: { tournamentId: string }) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  })
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchMatches = async () => {
      const { data } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!home_team_id(id, name),
          away_team:teams!away_team_id(id, name)
        `)
        .eq('tournament_id', tournamentId)
        .order('start_time', { ascending: true })

      if (data) {
        setMatches(data as Match[])
      }
      setLoading(false)
    }

    fetchMatches()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `tournament_id=eq.${tournamentId}`
        },
        () => {
          // Re-fetch to get joined relations easily
          fetchMatches()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tournamentId, supabase])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setCurrentTime(now.getHours() * 60 + now.getMinutes())
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">Loading live scores...</div>
  }

  const inProgressMatches = matches.filter(m => m.status === 'in_progress')
  const finishedMatches = matches.filter(m => m.status === 'finished')
  
  const fields = Array.from(new Set(matches.map(m => m.field).filter(Boolean))).sort()

  const getActiveMatchForField = (fieldMatches: Match[]) => {
    if (fieldMatches.length === 0) return null;

    const sortedMatches = [...fieldMatches].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

    for (const match of sortedMatches) {
      if (!match.start_time) continue;
      const [h, m] = match.start_time.split(':').map(Number);
      const startMinutes = h * 60 + m;
      const duration = match.stage === 'group' ? 20 : 30;
      
      if (currentTime >= startMinutes && currentTime < startMinutes + duration) {
        return { match, state: 'playing' as const };
      }
    }

    const upcomingMatch = sortedMatches.find(match => {
      if (!match.start_time) return false;
      const [h, m] = match.start_time.split(':').map(Number);
      const startMinutes = h * 60 + m;
      return startMinutes > currentTime;
    });

    if (upcomingMatch) {
      return { match: upcomingMatch, state: 'upcoming' as const };
    }

    return { match: sortedMatches[sortedMatches.length - 1], state: 'finished' as const };
  }

  return (
    <div className="flex flex-col gap-12">
      <TournamentResults matches={matches} />

      {/* Field Overview */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="size-2.5 rounded-full bg-blue-500"></div>
          <h3 className="text-2xl font-bold">Field Overview</h3>
        </div>
        
        {fields.length === 0 ? (
          <Card className="p-8 text-center bg-secondary/20">
            <p className="text-muted-foreground">No matches scheduled on fields.</p>
          </Card>
        ) : (
          <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))` }}>
            {fields.map(field => {
              const fieldMatches = matches.filter(m => m.field === field);
              const activeMatchInfo = getActiveMatchForField(fieldMatches);
              
              if (!activeMatchInfo) return null;
              
              return (
                <div key={field} className="flex flex-col gap-4">
                  <div className="bg-secondary/50 rounded-lg py-3 px-4 text-center border border-border/50 shadow-sm">
                    <h4 className="text-lg font-bold uppercase tracking-widest text-primary">Field {field}</h4>
                  </div>
                  <MatchCard match={activeMatchInfo.match} state={activeMatchInfo.state} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Finished Matches */}
      {finishedMatches.length > 0 && (
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-bold text-muted-foreground">Recent Results</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finishedMatches.map(match => (
              <MatchCard key={match.id} match={match} state="finished" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, state }: { match: Match, state: 'playing' | 'upcoming' | 'finished' }) {
  const homeTeamName = match.home_team?.name || 'TBD'
  const awayTeamName = match.away_team?.name || 'TBD'
  
  const isFinished = state === 'finished';
  
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 h-full ${isFinished ? 'bg-secondary/10' : 'shadow-xl'}`}>
      {state === 'playing' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      )}
      
      <CardContent className="p-6 h-full flex flex-col justify-center">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2 items-center">
            <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
              {match.stage === 'group' ? 'Group Stage' : match.stage.replace('_', ' ')}
            </Badge>
            {match.start_time && (
              <span className="text-muted-foreground text-xs font-medium">
                {formatTime(match.start_time)}
              </span>
            )}
          </div>
          {state === 'playing' && (
            <Badge variant="destructive" className="flex items-center gap-1 text-[10px]">
              <span className="size-1.5 rounded-full bg-white animate-pulse"></span>
              LIVE
            </Badge>
          )}
          {state === 'upcoming' && (
            <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground text-[10px]">
              UPCOMING
            </Badge>
          )}
          {state === 'finished' && (
            <Badge variant="secondary" className="flex items-center gap-1 text-[10px]">
              FINISHED
            </Badge>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-right flex-1 min-w-0">
            <p className={`font-bold text-lg truncate ${isFinished && match.home_score < match.away_score ? 'text-muted-foreground' : 'text-foreground'}`}>
              {homeTeamName}
            </p>
          </div>
          
          {state === 'upcoming' ? (
            <div className="px-6 flex items-center gap-3 text-muted-foreground/50 font-black text-xl italic">
              VS
            </div>
          ) : (
            <div className="px-4 flex items-center gap-3">
              <span className={`text-2xl font-black ${isFinished ? 'text-foreground' : 'text-primary'}`}>{match.home_score}</span>
              <span className="text-muted-foreground font-bold">-</span>
              <span className={`text-2xl font-black ${isFinished ? 'text-foreground' : 'text-primary'}`}>{match.away_score}</span>
            </div>
          )}
          
          <div className="text-left flex-1 min-w-0">
            <p className={`font-bold text-lg truncate ${isFinished && match.away_score < match.home_score ? 'text-muted-foreground' : 'text-foreground'}`}>
              {awayTeamName}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
