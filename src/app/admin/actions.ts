'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function setAdminTournamentCookie(tournamentId: string) {
  const cookieStore = await cookies()
  cookieStore.set('admin_tournament_id', tournamentId, { 
    path: '/admin',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })
  
  // Revalidate the entire admin section so layout and pages refresh with new data
  revalidatePath('/admin', 'layout')
}
