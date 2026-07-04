'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateMatchStatus(matchId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('matches')
    .update({
      status,
    })
    .eq('id', matchId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/matches/${matchId}`);
  revalidatePath('/admin/matches');
  revalidatePath('/');
}
