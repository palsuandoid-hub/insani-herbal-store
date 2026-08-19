import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidUrl = typeof supabaseUrl === 'string' && /^https:\/\/[^\s/]+/.test(supabaseUrl)

if (!isValidUrl || !supabaseAnonKey) {
  console.error('[v0] Supabase configuration is missing or invalid. Check the project environment variables.')
}

export const supabase = isValidUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
