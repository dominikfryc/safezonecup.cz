'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addPlayer(formData: FormData) {
  const supabase = await createClient()
  
  const tournament_id = formData.get('tournament_id') as string
  const team_id = formData.get('team_id') as string
  const name = formData.get('name') as string
  
  if (!tournament_id || !team_id || !name) return

  await supabase.from('players').insert({
    tournament_id,
    team_id,
    name
  })

  revalidatePath(`/admin/teams/${team_id}`)
}

export async function editPlayer(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const team_id = formData.get('team_id') as string
  const name = formData.get('name') as string
  
  if (!id || !name || !team_id) return

  await supabase.from('players').update({ name }).eq('id', id)

  revalidatePath(`/admin/teams/${team_id}`)
}

export async function removePlayer(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const team_id = formData.get('team_id') as string
  
  if (!id || !team_id) return

  await supabase.from('players').delete().eq('id', id)

  revalidatePath(`/admin/teams/${team_id}`)
}
