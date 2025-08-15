// src/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Чете Vite променливите от средата (Vercel/.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  const msg = [
    '❌ Missing Supabase env vars!',
    `VITE_SUPABASE_URL: ${supabaseUrl ? 'OK' : 'MISSING'}`,
    `VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'OK' : 'MISSING'}`,
    '',
    'Fix:',
    '- Vercel → Project → Settings → Environment Variables',
    '- Add/Save BOTH variables for “All Environments” exactly as named above',
    '- Then Redeploy',
    '',
    'For local dev, create .env file with:',
    'VITE_SUPABASE_URL=YOUR_URL',
    'VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY',
  ].join('\n')
  console.error(msg)
  // Спираме приложението рано с ясна причина
  throw new Error('Supabase env vars are missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export default supabase
