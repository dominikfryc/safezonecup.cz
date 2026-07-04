'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculateTeamStats, sortTeams } from '@/lib/standings'

export async function createMatch(formData: FormData) {
  const supabase = await createClient()
  
  const tournament_id = formData.get('tournament_id') as string
  const stage = formData.get('stage') as string
  const home_team_id = formData.get('home_team_id') as string
  const away_team_id = formData.get('away_team_id') as string
  const fieldRaw = formData.get('field') as string
  const field = fieldRaw === 'none' || !fieldRaw ? null : fieldRaw
  const start_time = formData.get('start_time') as string || null
  
  if (!tournament_id || !home_team_id || !away_team_id) return

  await supabase.from('matches').insert({
    tournament_id,
    stage,
    home_team_id,
    away_team_id,
    field,
    start_time,
    status: 'scheduled',
    home_score: 0,
    away_score: 0
  })

  revalidatePath('/admin/matches')
  revalidatePath('/')
}

export async function updateMatch(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const stage = formData.get('stage') as string
  const status = formData.get('status') as string
  const home_team_id = formData.get('home_team_id') as string
  const away_team_id = formData.get('away_team_id') as string
  const fieldRaw = formData.get('field') as string
  const field = fieldRaw === 'none' || !fieldRaw ? null : fieldRaw
  const start_time = formData.get('start_time') as string || null

  if (!id) return

  await supabase.from('matches').update({
    stage,
    status,
    home_team_id,
    away_team_id,
    field,
    start_time
  }).eq('id', id)

  revalidatePath('/admin/matches')
  revalidatePath('/')
  revalidatePath(`/admin/matches/${id}`)
}

export async function deleteMatch(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  if (!id) return

  await supabase.from('matches').delete().eq('id', id)

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
  const { data: allTeams } = await supabase.from('teams').select('id, name, group').eq('tournament_id', tournament_id)
  const allTeamIds = allTeams?.map(t => t.id) || []
  
  const stats = calculateTeamStats(matches, allTeamIds)

  // Sort
  const sortableTeams = (allTeams || []).map(t => ({
    id: t.id,
    name: t.name,
    group: t.group,
    pts: stats[t.id]?.pts || 0,
    gd: stats[t.id]?.gd || 0,
    gs: stats[t.id]?.gs || 0
  }))

  const sortedTeamIds = sortTeams(sortableTeams).map(t => t.id)

  if (sortedTeamIds.length < 12) {
    throw new Error('Not enough teams to generate full 12-team playoff')
  }

  const bigPlayoff = sortedTeamIds.slice(0, 8)
  const smallPlayoff = sortedTeamIds.slice(8, 12)

  // Fetch tournament to get number of fields
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('number_of_fields')
    .eq('id', tournament_id)
    .single()

  const numFields = tournament?.number_of_fields || 1
  const availableFields = Array.from({ length: numFields }, (_, i) => String.fromCharCode(65 + i))

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

  let currentSlot = 0; // 0 for 13:00, 1 for 13:30, etc.
  let fieldIndex = 0;

  for (const match of matchups) {
    const totalMinutes = 13 * 60 + currentSlot * 30; // 13:00
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    
    const field = availableFields[fieldIndex];

    await supabase.from('matches').insert({
      tournament_id,
      stage: match.stage,
      home_team_id: match.home,
      away_team_id: match.away,
      field,
      start_time: timeString,
      status: 'scheduled',
      home_score: 0,
      away_score: 0
    })

    fieldIndex++;
    if (fieldIndex >= availableFields.length) {
      fieldIndex = 0;
      currentSlot++; // Move to next 30 min slot after all fields are filled
    }
  }

  revalidatePath('/admin/matches')
  revalidatePath('/')
}

export async function generateSemifinals(formData: FormData) {
  const supabase = await createClient()
  const tournament_id = formData.get('tournament_id') as string

  // 1. Fetch quarterfinal and small_semifinal matches
  const { data: previousMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournament_id)
    .in('stage', ['quarterfinal', 'small_semifinal'])
    .eq('status', 'finished')
    .order('created_at', { ascending: true })

  const qfMatches = previousMatches?.filter(m => m.stage === 'quarterfinal') || []
  const smallSfMatches = previousMatches?.filter(m => m.stage === 'small_semifinal') || []

  if (qfMatches.length < 4 || smallSfMatches.length < 2) {
    throw new Error('Not all playoff matches are finished')
  }

  // Determine winners and losers for QF
  const qfWinners = qfMatches.map(m => m.home_score > m.away_score ? m.home_team_id : m.away_team_id)
  const qfLosers = qfMatches.map(m => m.home_score > m.away_score ? m.away_team_id : m.home_team_id)

  // Determine winners and losers for Small SF
  const smallSfWinners = smallSfMatches.map(m => m.home_score > m.away_score ? m.home_team_id : m.away_team_id)
  const smallSfLosers = smallSfMatches.map(m => m.home_score > m.away_score ? m.away_team_id : m.home_team_id)

  // Fetch tournament to get number of fields
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('number_of_fields')
    .eq('id', tournament_id)
    .single()

  const numFields = tournament?.number_of_fields || 1
  const availableFields = Array.from({ length: numFields }, (_, i) => String.fromCharCode(65 + i))

  const matchups = [
    // Semifinals (1st-4th)
    { home: qfWinners[0], away: qfWinners[3], stage: 'semifinal' },
    { home: qfWinners[1], away: qfWinners[2], stage: 'semifinal' },
    // 5th place
    { home: qfLosers[0], away: qfLosers[3], stage: '5th_place' },
    // 7th place
    { home: qfLosers[1], away: qfLosers[2], stage: '7th_place' },
    // 9th place
    { home: smallSfWinners[0], away: smallSfWinners[1], stage: '9th_place' },
    // 11th place
    { home: smallSfLosers[0], away: smallSfLosers[1], stage: '11th_place' },
  ]

  let currentSlot = 0;
  let fieldIndex = 0;

  for (const match of matchups) {
    const totalMinutes = 14 * 60 + 30 + currentSlot * 30; // 14:30
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    
    const field = availableFields[fieldIndex];

    await supabase.from('matches').insert({
      tournament_id,
      stage: match.stage,
      home_team_id: match.home,
      away_team_id: match.away,
      field,
      start_time: timeString,
      status: 'scheduled',
      home_score: 0,
      away_score: 0
    })

    fieldIndex++;
    if (fieldIndex >= availableFields.length) {
      fieldIndex = 0;
      currentSlot++; // Move to next 30 min slot after all fields are filled
    }
  }

  revalidatePath('/admin/matches')
  revalidatePath('/')
}

export async function generateGroupMatches(formData: FormData) {
  const supabase = await createClient()
  const tournament_id = formData.get('tournament_id') as string

  // 1. Fetch tournament to know number of groups and fields, and all teams
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('number_of_groups, number_of_fields')
    .eq('id', tournament_id)
    .single()

  const { data: teams } = await supabase
    .from('teams')
    .select('id, group')
    .eq('tournament_id', tournament_id)

  if (!tournament || !teams) return

  const availableGroups = Array.from({ length: tournament.number_of_groups }, (_, i) => String(i + 1))
  const numFields = tournament.number_of_fields || 1
  const availableFields = Array.from({ length: numFields }, (_, i) => String.fromCharCode(65 + i))

  // 2. Clear existing group stage matches for this tournament to avoid duplicates
  await supabase
    .from('matches')
    .delete()
    .eq('tournament_id', tournament_id)
    .eq('stage', 'group')

  // 3. Generate raw Round Robin matches per group
  type RawMatch = { home: string; away: string }
  let unscheduledMatches: RawMatch[] = []

  for (const group of availableGroups) {
    const groupTeams = teams.filter(t => t.group === group)
    
    // Simple Round Robin algorithm
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        unscheduledMatches.push({
          home: groupTeams[i].id,
          away: groupTeams[j].id
        })
      }
    }
  }

  // 4. Time-slot based scheduling algorithm
  const scheduledMatches = []
  const teamLastPlayed: Record<string, number> = {}
  
  // Initialize all teams with -1
  teams.forEach(t => teamLastPlayed[t.id] = -1)
  
  let slotIndex = 0

  while (unscheduledMatches.length > 0) {
    const teamsPlayingThisSlot = new Set<string>()

    for (const field of availableFields) {
      if (unscheduledMatches.length === 0) break

      // Find valid matches where neither team is playing in this slot
      const validMatches = unscheduledMatches.filter(
        m => !teamsPlayingThisSlot.has(m.home) && !teamsPlayingThisSlot.has(m.away)
      )

      if (validMatches.length > 0) {
        // Sort to prioritize teams that haven't played in a while
        // We look at the maximum slot index either team last played
        // Lower number means they played longer ago (or haven't played at all: -1)
        validMatches.sort((a, b) => {
          const maxA = Math.max(teamLastPlayed[a.home], teamLastPlayed[a.away])
          const maxB = Math.max(teamLastPlayed[b.home], teamLastPlayed[b.away])
          
          if (maxA !== maxB) return maxA - maxB
          
          // Tie breaker: minimum slot index either team last played
          const minA = Math.min(teamLastPlayed[a.home], teamLastPlayed[a.away])
          const minB = Math.min(teamLastPlayed[b.home], teamLastPlayed[b.away])
          return minA - minB
        })

        const selectedMatch = validMatches[0]
        
        // Remove from unscheduled
        unscheduledMatches = unscheduledMatches.filter(
          m => !(m.home === selectedMatch.home && m.away === selectedMatch.away)
        )

        // Calculate time
        const totalMinutes = slotIndex * 20
        const hour = 9 + Math.floor(totalMinutes / 60)
        const minute = totalMinutes % 60
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`

        scheduledMatches.push({
          tournament_id,
          stage: 'group',
          home_team_id: selectedMatch.home,
          away_team_id: selectedMatch.away,
          field,
          start_time: timeString,
          status: 'scheduled',
          home_score: 0,
          away_score: 0
        })

        teamsPlayingThisSlot.add(selectedMatch.home)
        teamsPlayingThisSlot.add(selectedMatch.away)
        teamLastPlayed[selectedMatch.home] = slotIndex
        teamLastPlayed[selectedMatch.away] = slotIndex
      }
    }

    slotIndex++
  }

  // 5. Insert all generated matches
  if (scheduledMatches.length > 0) {
    await supabase.from('matches').insert(scheduledMatches)
  }

  revalidatePath('/admin/matches')
  revalidatePath('/')
}

export async function generateFinals(formData: FormData) {
  const supabase = await createClient()
  const tournament_id = formData.get('tournament_id') as string

  // Fetch semifinal matches
  const { data: sfMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournament_id)
    .eq('stage', 'semifinal')
    .eq('status', 'finished')
    .order('created_at', { ascending: true })

  if (!sfMatches || sfMatches.length < 2) {
    throw new Error('Not all semifinals are finished')
  }

  // Determine winners and losers
  const sfWinners = sfMatches.map(m => m.home_score > m.away_score ? m.home_team_id : m.away_team_id)
  const sfLosers = sfMatches.map(m => m.home_score > m.away_score ? m.away_team_id : m.home_team_id)

  // Fetch tournament to get number of fields
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('number_of_fields')
    .eq('id', tournament_id)
    .single()

  const numFields = tournament?.number_of_fields || 1
  const availableFields = Array.from({ length: numFields }, (_, i) => String.fromCharCode(65 + i))

  const matchups = [
    // 1st place (Final)
    { home: sfWinners[0], away: sfWinners[1], stage: 'final' },
    // 3rd place (Small Final)
    { home: sfLosers[0], away: sfLosers[1], stage: 'small_final' },
  ]

  let currentSlot = 0;
  let fieldIndex = 0;

  for (const match of matchups) {
    const totalMinutes = 16 * 60 + currentSlot * 30; // 16:00
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    
    const field = availableFields[fieldIndex];

    await supabase.from('matches').insert({
      tournament_id,
      stage: match.stage,
      home_team_id: match.home,
      away_team_id: match.away,
      field,
      start_time: timeString,
      status: 'scheduled',
      home_score: 0,
      away_score: 0
    })

    fieldIndex++;
    if (fieldIndex >= availableFields.length) {
      fieldIndex = 0;
      currentSlot++; // Move to next 30 min slot after all fields are filled
    }
  }

  revalidatePath('/admin/matches')
  revalidatePath('/')
}
