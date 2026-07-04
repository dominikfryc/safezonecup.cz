'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTeam(formData: FormData) {
  const supabase = await createClient();

  const tournament_id = formData.get('tournament_id') as string;
  const name = formData.get('name') as string;
  const group = formData.get('group') as string;

  if (!tournament_id || !name) return;

  const finalGroup = group === '' || group === 'Unassigned' ? null : group;

  await supabase.from('teams').insert({
    tournament_id,
    name,
    group: finalGroup,
  });

  revalidatePath('/admin/teams');
}

export async function editTeam(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const group = formData.get('group') as string;

  if (!id || !name) return;

  const finalGroup = group === '' || group === 'Unassigned' ? null : group;

  await supabase.from('teams').update({ name, group: finalGroup }).eq('id', id);

  revalidatePath('/admin/teams');
}

export async function removeTeam(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;

  if (!id) return;

  await supabase.from('teams').delete().eq('id', id);

  revalidatePath('/admin/teams');
}
