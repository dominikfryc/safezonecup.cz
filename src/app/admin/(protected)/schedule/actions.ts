'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addScheduleItem(formData: FormData) {
  const supabase = await createClient();

  const tournament_id = formData.get('tournament_id') as string;
  const time = formData.get('time') as string;
  const event = formData.get('event') as string;

  if (!tournament_id || !time || !event) return;

  await supabase.from('schedules').insert({
    tournament_id,
    time,
    event,
  });

  revalidatePath('/admin/schedule');
}

export async function editScheduleItem(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;
  const time = formData.get('time') as string;
  const event = formData.get('event') as string;

  if (!id || !time || !event) return;

  await supabase.from('schedules').update({ time, event }).eq('id', id);

  revalidatePath('/admin/schedule');
}

export async function removeScheduleItem(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;

  if (!id) return;

  await supabase.from('schedules').delete().eq('id', id);

  revalidatePath('/admin/schedule');
}
