'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Match } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Scoreboard({ tournamentId }: { tournamentId: string }) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">Loading live scores...</div>
  }

  const inProgressMatches = matches.filter(m => m.status === 'in_progress')
  const finishedMatches = matches.filter(m => m.status === 'finished')

  return (
    <div className="flex flex-col gap-12">
      {/* Live Matches */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="size-2.5 rounded-full bg-destructive animate-ping"></div>
          <h3 className="text-2xl font-bold">Live Now</h3>
        </div>
        
        {inProgressMatches.length === 0 ? (
          <Card className="p-8 text-center bg-secondary/20">
            <p className="text-muted-foreground">No matches currently in progress.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>

      {/* Finished Matches */}
      {finishedMatches.length > 0 && (
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-bold text-muted-foreground">Recent Results</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finishedMatches.map(match => (
              <MatchCard key={match.id} match={match} isFinished />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, isFinished = false }: { match: Match, isFinished?: boolean }) {
  const homeTeamName = match.home_team?.name || 'TBD'
  const awayTeamName = match.away_team?.name || 'TBD'
  
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${isFinished ? 'bg-secondary/10' : 'shadow-xl'}`}>
      {!isFinished && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      )}
      
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Badge variant="secondary" className="uppercase tracking-wider text-xs">
            {match.stage === 'group' ? 'Group Stage' : match.stage.replace('_', ' ')}
          </Badge>
          {!isFinished && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-white animate-pulse"></span>
              LIVE
            </Badge>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-right flex-1">
            <p className={`font-bold text-lg ${isFinished && match.home_score < match.away_score ? 'text-muted-foreground' : 'text-foreground'}`}>
              {homeTeamName}
            </p>
          </div>
          
          <div className="px-6 flex items-center gap-3">
            <span className={`text-3xl font-black ${isFinished ? 'text-foreground' : 'text-primary'}`}>{match.home_score}</span>
            <span className="text-muted-foreground font-bold">-</span>
            <span className={`text-3xl font-black ${isFinished ? 'text-foreground' : 'text-primary'}`}>{match.away_score}</span>
          </div>
          
          <div className="text-left flex-1">
            <p className={`font-bold text-lg ${isFinished && match.away_score < match.home_score ? 'text-muted-foreground' : 'text-foreground'}`}>
              {awayTeamName}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
