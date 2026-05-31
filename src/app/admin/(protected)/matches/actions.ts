'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMatch(formData: FormData) {
  const supabase = await createClient()
  
  const tournament_id = formData.get('tournament_id') as string
  const stage = formData.get('stage') as string
  const home_team_id = formData.get('home_team_id') as string
  const away_team_id = formData.get('away_team_id') as string
  
  if (!tournament_id || !home_team_id || !away_team_id) return

  await supabase.from('matches').insert({
    tournament_id,
    stage,
    home_team_id,
    away_team_id,
    status: 'scheduled',
    home_score: 0,
    away_score: 0
  })

  revalidatePath('/admin/matches')
  revalidatePath('/')
}

export async function updateMatchScore(formData: FormData) {
  const supabase = await createClient()
  
  const match_id = formData.get('match_id') as string
  const home_score = parseInt(formData.get('home_score') as string)
  const away_score = parseInt(formData.get('away_score') as string)
  const status = formData.get('status') as string

  await supabase.from('matches').update({
    home_score,
    away_score,
    status
  }).eq('id', match_id)

  revalidatePath('/admin/matches')
  revalidatePath('/')
}

export async function generatePlayoffs(formData: FormData) {
  const supabase = await createClient()
  const tournament_id = formData.get('tournament_id') as string

  // 1. Fetch all group matches
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournament_id)
    .eq('stage', 'group')
    .eq('status', 'finished')

  if (!matches) return

  // 2. Calculate standings
  const stats: Record<string, { pts: number, gd: number, gs: number }> = {}

  matches.forEach(m => {
    const home = m.home_team_id
    const away = m.away_team_id
    
    if (!stats[home]) stats[home] = { pts: 0, gd: 0, gs: 0 }
    if (!stats[away]) stats[away] = { pts: 0, gd: 0, gs: 0 }

    stats[home].gs += m.home_score
    stats[away].gs += m.away_score
    
    stats[home].gd += (m.home_score - m.away_score)
    stats[away].gd += (m.away_score - m.home_score)

    if (m.home_score > m.away_score) {
      stats[home].pts += 3
    } else if (m.home_score < m.away_score) {
      stats[away].pts += 3
    } else {
      stats[home].pts += 1
      stats[away].pts += 1
    }
  })

  // Ensure all tournament teams are in stats (even if 0 points)
  const { data: allTeams } = await supabase.from('teams').select('id').eq('tournament_id', tournament_id)
  allTeams?.forEach(t => {
    if (!stats[t.id]) stats[t.id] = { pts: 0, gd: 0, gs: 0 }
  })

  // Sort
  const sortedTeamIds = Object.keys(stats).sort((a, b) => {
    const diffPts = stats[b].pts - stats[a].pts
    if (diffPts !== 0) return diffPts
    
    const diffGd = stats[b].gd - stats[a].gd
    if (diffGd !== 0) return diffGd
    
    return stats[b].gs - stats[a].gs
  })

  if (sortedTeamIds.length < 12) {
    throw new Error('Not enough teams to generate full 12-team playoff')
  }

  const bigPlayoff = sortedTeamIds.slice(0, 8)
  const smallPlayoff = sortedTeamIds.slice(8, 12)

  // 3. Create Matches
  // Big Playoff: 1v5, 2v6, 3v7, 4v8
  const matchups = [
    { home: bigPlayoff[0], away: bigPlayoff[4], stage: 'quarterfinal' }, // 1v5
    { home: bigPlayoff[1], away: bigPlayoff[5], stage: 'quarterfinal' }, // 2v6
    { home: bigPlayoff[2], away: bigPlayoff[6], stage: 'quarterfinal' }, // 3v7
    { home: bigPlayoff[3], away: bigPlayoff[7], stage: 'quarterfinal' }, // 4v8
    // Small Playoff: 9v11, 10v12
    { home: smallPlayoff[0], away: smallPlayoff[2], stage: 'small_semifinal' }, // 9v11
    { home: smallPlayoff[1], away: smallPlayoff[3], stage: 'small_semifinal' }, // 10v12
  ]

  for (const match of matchups) {
    await supabase.from('matches').insert({
      tournament_id,
      stage: match.stage,
      home_team_id: match.home,
      away_team_id: match.away,
      status: 'scheduled',
      home_score: 0,
      away_score: 0
    })
  }

  revalidatePath('/admin/matches')
  revalidatePath('/')
}

export async function generateGroupMatches(formData: FormData) {
  const supabase = await createClient()
  const tournament_id = formData.get('tournament_id') as string

  // 1. Fetch tournament to know number of groups, and all teams
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('number_of_groups')
    .eq('id', tournament_id)
    .single()

  const { data: teams } = await supabase
    .from('teams')
    .select('id, group')
    .eq('tournament_id', tournament_id)

  if (!tournament || !teams) return

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const availableGroups = alphabet.slice(0, tournament.number_of_groups).split('')

  // 2. Clear existing group stage matches for this tournament to avoid duplicates
  await supabase
    .from('matches')
    .delete()
    .eq('tournament_id', tournament_id)
    .eq('stage', 'group')

  // 3. Generate Round Robin matches per group
  const matchesToInsert = []

  for (const group of availableGroups) {
    const groupTeams = teams.filter(t => t.group === group)
    
    // Simple Round Robin algorithm: each team plays every other team once
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        matchesToInsert.push({
          tournament_id,
          stage: 'group',
          home_team_id: groupTeams[i].id,
          away_team_id: groupTeams[j].id,
          status: 'scheduled',
          home_score: 0,
          away_score: 0
        })
      }
    }
  }

  // 4. Insert all generated matches
  if (matchesToInsert.length > 0) {
    await supabase.from('matches').insert(matchesToInsert)
  }

  revalidatePath('/admin/matches')
  revalidatePath('/')
}
