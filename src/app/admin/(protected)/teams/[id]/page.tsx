import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreatePlayerDialog } from './create-player-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlayerActions } from './player-actions'

export default async function TeamDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: teamId } = await params
  
  const supabase = await createClient()

  // Get team
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()
    
  if (!team) {
    redirect('/admin/teams')
  }

  // Get players
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .order('name')

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <Button variant="ghost" size="sm" className="mb-4 -ml-3" asChild>
          <Link href="/admin/teams">
            <ArrowLeft className="mr-2 size-4" />
            Back to Teams
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{team.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            {players && players.length > 0 && (
              <CreatePlayerDialog teamId={team.id} tournamentId={team.tournament_id} />
            )}
          </div>
        </div>
      </div>

      <div className="w-full rounded-md border overflow-hidden bg-card">
        {players?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Users className="size-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No players added</h2>
            <p className="mt-2 text-center text-sm font-normal leading-tight text-muted-foreground max-w-sm mb-6">
              You haven&apos;t added any players to this team yet. Add players to complete your roster.
            </p>
            <CreatePlayerDialog teamId={team.id} tournamentId={team.tournament_id} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Player Name</TableHead>
                <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players?.map((player) => (
                <TableRow key={player.id} className="relative group">
                  <TableCell className="font-medium whitespace-nowrap">
                    {player.name}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end relative z-10">
                      <PlayerActions player={player} teamId={team.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
