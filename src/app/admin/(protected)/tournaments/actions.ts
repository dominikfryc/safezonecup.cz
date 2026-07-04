'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTournament(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const location = formData.get('location') as string;
  const number_of_groups = parseInt(formData.get('number_of_groups') as string);
  const number_of_teams = parseInt(formData.get('number_of_teams') as string);
  const number_of_fields = parseInt(formData.get('number_of_fields') as string) || 1;

  // Set all others to inactive
  await supabase
    .from('tournaments')
    .update({ is_active: false })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase.from('tournaments').insert({
    name,
    location: location || null,
    number_of_groups,
    number_of_fields,
    number_of_teams,
    is_active: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
}

export async function setActiveTournament(tournamentId: string) {
  const supabase = await createClient();

  // Set all to inactive
  await supabase
    .from('tournaments')
    .update({ is_active: false })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  // Set selected to active
  await supabase.from('tournaments').update({ is_active: true }).eq('id', tournamentId);

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function editTournament(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const location = formData.get('location') as string;
  const number_of_groups = parseInt(formData.get('number_of_groups') as string);
  const number_of_teams = parseInt(formData.get('number_of_teams') as string);
  const number_of_fields = parseInt(formData.get('number_of_fields') as string) || 1;

  const { error } = await supabase
    .from('tournaments')
    .update({
      name,
      location: location || null,
      number_of_groups,
      number_of_fields,
      number_of_teams,
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  revalidatePath('/');
}
