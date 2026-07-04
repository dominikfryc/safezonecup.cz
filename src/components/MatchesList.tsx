'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Match } from '@/lib/types'
import Schedule from './Schedule'

export default function MatchesList({ tournamentId }: { tournamentId: string }) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchMatches = async () => {
      const { data } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!home_team_id(id, name),
          away_team:teams!away_team_id(id, name),
          goals(id, team_id, players(id, name))
        `)
        .eq('tournament_id', tournamentId)
        .order('start_time', { ascending: true })

      if (data) {
        setMatches(data as Match[])
      }
      setLoading(false)
    }

    fetchMatches()

    const channel = supabase
      .channel('schema-db-changes-matches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `tournament_id=eq.${tournamentId}` },
        () => fetchMatches()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tournamentId, supabase])

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">Loading matches...</div>
  }

  return (
    <div className="flex flex-col gap-12">
      <Schedule matches={matches} />
    </div>
  )
}
