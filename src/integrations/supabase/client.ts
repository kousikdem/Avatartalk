
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a mock client if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using mock client for development.')
}

// Create the Supabase client - either real or mock
export const supabase = (!supabaseUrl || !supabaseAnonKey) ? {
  auth: {
    signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
    signUp: async () => ({ error: { message: 'Supabase not configured' } }),
    signInWithOAuth: async () => ({ error: { message: 'Supabase not configured' } }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
} as any : createClient(supabaseUrl, supabaseAnonKey)
