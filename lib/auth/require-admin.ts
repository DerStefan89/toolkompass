import { createClient } from '@/lib/supabase/server'

export class AuthError extends Error {
  constructor() {
    super('Nicht autorisiert.')
    this.name = 'AuthError'
  }
}

export async function requireAdmin(): Promise<{ userId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new AuthError()
  if (user.app_metadata?.role !== 'admin') throw new AuthError()
  return { userId: user.id }
}
