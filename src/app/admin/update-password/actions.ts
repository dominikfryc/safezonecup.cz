'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  if (!password) return

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect('/admin/update-password?error=' + encodeURIComponent(error.message))
  }

  // Redirect to admin dashboard on success
  redirect('/admin')
}
