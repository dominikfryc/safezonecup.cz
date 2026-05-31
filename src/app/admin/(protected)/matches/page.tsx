import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { createMatch, updateMatchScore, generatePlayoffs, generateGroupMatches } from './actions'
import { Trophy } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export default async function MatchesPage() {
  const supabase = await createClient()

  const cookieStore = await cookies()
  const adminTournamentId = cookieStore.get('admin_tournament_id')?.value

  let activeTournament = null

  if (adminTournamentId) {
    const { data } = await supabase.from('tournaments').select('*').eq('id', adminTournamentId).single()
    activeTournament = data
  }

  if (!activeTournament) {
    const { data } = await supabase.from('tournaments').select('*').eq('is_active', true).limit(1)
    activeTournament = data?.[0]
  }

  if (!activeTournament) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">No Active Tournament</h2>
      </div>
    )
  }

  const { data: tournamentTeams } = await supabase
    .from('teams')
    .select('*')
    .eq('tournament_id', activeTournament.id)

  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(id, name), away_team:teams!away_team_id(id, name)')
    .eq('tournament_id', activeTournament.id)
    .order('start_time', { ascending: false })

  const groupMatches = matches?.filter(m => m.stage === 'group') || []
  const playoffMatches = matches?.filter(m => m.stage !== 'group') || []
  
  const allGroupMatchesFinished = groupMatches.length > 0 && groupMatches.every(m => m.status === 'finished')
  const playoffsGenerated = playoffMatches.length > 0

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Match Management</h1>
          <p className="text-muted-foreground">Update scores and manage the tournament flow</p>
        </div>
        <div className="flex gap-2">
          {groupMatches.length === 0 && (
            <form action={generateGroupMatches}>
              <input type="hidden" name="tournament_id" value={activeTournament.id} />
              <Button 
                type="submit" 
                variant="outline"
                className="font-bold flex items-center gap-2"
              >
                <Trophy className="size-4" />
                Generate Group Matches
              </Button>
            </form>
          )}

          {allGroupMatchesFinished && !playoffsGenerated && (
            <form action={generatePlayoffs}>
              <input type="hidden" name="tournament_id" value={activeTournament.id} />
              <Button 
                type="submit" 
                className="font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Trophy className="size-5" />
                Generate Playoffs
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Create Match */}
        <Card className="h-fit rounded-md">
          <CardHeader>
            <CardTitle>Create Match</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createMatch} className="flex flex-col gap-4">
              <input type="hidden" name="tournament_id" value={activeTournament.id} />
              
              <FieldGroup>
                <Field>
                  <FieldLabel>Stage</FieldLabel>
                  <Select name="stage" defaultValue="group">
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="group">Group Stage</SelectItem>
                        <SelectItem value="quarterfinal">Quarterfinal</SelectItem>
                        <SelectItem value="semifinal">Semifinal</SelectItem>
                        <SelectItem value="small_semifinal">Small Semifinal</SelectItem>
                        <SelectItem value="small_final">Small Final</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Home Team</FieldLabel>
                  <Select name="home_team_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select home team..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {tournamentTeams?.map(tt => (
                          <SelectItem key={tt.id} value={tt.id}>{tt.name} {tt.group_name ? `(Group ${tt.group_name})` : ''}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Away Team</FieldLabel>
                  <Select name="away_team_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select away team..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {tournamentTeams?.map(tt => (
                          <SelectItem key={tt.id} value={tt.id}>{tt.name} {tt.group_name ? `(Group ${tt.group_name})` : ''}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <Button type="submit" className="w-full mt-2">
                Create Match
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Matches List */}
        <Card className="lg:col-span-2 rounded-md p-6 flex flex-col gap-6">
          <h2 className="text-xl font-semibold">All Matches</h2>
          
          <div className="flex flex-col gap-4">
            {matches?.map(match => (
              <Card key={match.id} className="p-5 shadow-sm rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="secondary" className="uppercase tracking-wider text-xs">
                    {match.stage.replace('_', ' ')}
                  </Badge>
                  <Badge variant={
                    match.status === 'finished' ? 'default' :
                    match.status === 'in_progress' ? 'destructive' :
                    'outline'
                  } className={match.status === 'in_progress' ? 'animate-pulse' : ''}>
                    {match.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <form action={updateMatchScore} className="flex items-center justify-between gap-4">
                  <input type="hidden" name="match_id" value={match.id} />
                  
                  <div className="flex-1 text-right font-medium text-lg">
                    {match.home_team?.name}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      name="home_score" 
                      defaultValue={match.home_score}
                      min="0"
                      className="w-16 h-12 text-center font-bold text-xl"
                    />
                    <span className="text-muted-foreground font-bold">-</span>
                    <Input 
                      type="number" 
                      name="away_score" 
                      defaultValue={match.away_score}
                      min="0"
                      className="w-16 h-12 text-center font-bold text-xl"
                    />
                  </div>

                  <div className="flex-1 text-left font-medium text-lg">
                    {match.away_team?.name}
                  </div>

                  <div className="flex flex-col gap-2 w-32">
                    <Select name="status" defaultValue={match.status}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="finished">Finished</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button type="submit" size="sm" className="h-8 text-xs">
                      Update
                    </Button>
                  </div>
                </form>
              </Card>
            ))}

            {matches?.length === 0 && (
              <div className="text-center py-12 border rounded-xl border-dashed bg-secondary/20">
                <p className="text-muted-foreground">No matches created yet.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
