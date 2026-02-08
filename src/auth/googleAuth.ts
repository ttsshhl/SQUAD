import { supabase } from '../lib/supabase'

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = `${window.location.origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('Google sign-in error:', error.message)
    throw error
  }

  // Supabase сам перенаправит на Google
  // После авторизации вернёт на /auth/callback
}
