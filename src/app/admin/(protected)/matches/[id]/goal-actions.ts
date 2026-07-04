'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addGoal(formData: FormData) {
  const supabase = await createClient()
  
  const match_id = formData.get('match_id') as string
  const team_id = formData.get('team_id') as string
  const player_id = formData.get('player_id') as string

  if (!match_id || !team_id || !player_id) {
    throw new Error('Missing required fields')
  }

  // 1. Insert goal
  const { error } = await supabase.from('goals').insert({
    match_id,
    team_id,
    player_id
  })

  if (error) {
    throw new Error(error.message)
  }

  // 2. Update match score
  await updateMatchScoreFromGoals(match_id)

  revalidatePath(`/admin/matches/${match_id}`)
  revalidatePath('/admin/matches')
  revalidatePath('/')
}

export async function deleteGoal(formData: FormData) {
  const supabase = await createClient()
  const goal_id = formData.get('goal_id') as string
  const match_id = formData.get('match_id') as string

  if (!goal_id || !match_id) throw new Error('Missing required fields')

  const { error } = await supabase.from('goals').delete().eq('id', goal_id)
  if (error) throw new Error(error.message)

  await updateMatchScoreFromGoals(match_id)

  revalidatePath(`/admin/matches/${match_id}`)
  revalidatePath('/admin/matches')
  revalidatePath('/')
}

export async function updateGoal(formData: FormData) {
  const supabase = await createClient()
  const goal_id = formData.get('goal_id') as string
  const match_id = formData.get('match_id') as string
  const player_id = formData.get('player_id') as string

  if (!goal_id || !match_id || !player_id) throw new Error('Missing required fields')

  const { error } = await supabase.from('goals').update({
    player_id
  }).eq('id', goal_id)

  if (error) throw new Error(error.message)

  revalidatePath(`/admin/matches/${match_id}`)
}

async function updateMatchScoreFromGoals(match_id: string) {
  const supabase = await createClient()
  
  // Get match details to know who is home/away
  const { data: match } = await supabase
    .from('matches')
    .select('home_team_id, away_team_id')
    .eq('id', match_id)
    .single()

  if (!match) return

  // Count goals for home team
  const { count: home_score } = await supabase
    .from('goals')
    .select('*', { count: 'exact', head: true })
    .eq('match_id', match_id)
    .eq('team_id', match.home_team_id)

  // Count goals for away team
  const { count: away_score } = await supabase
    .from('goals')
    .select('*', { count: 'exact', head: true })
    .eq('match_id', match_id)
    .eq('team_id', match.away_team_id)

  // Update match
  await supabase.from('matches').update({
    home_score: home_score || 0,
    away_score: away_score || 0
  }).eq('id', match_id)
}
