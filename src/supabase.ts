import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xftcqzihjoqezqowbbdc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdGNxemloam9xZXpxb3diYmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODEzNzIsImV4cCI6MjA3MDg1NzM3Mn0.4fS1Soc5Q2D0OL5uUozAU_w2RIQibn6PBS9JDKyMrRc'

export const supabase = createClient(supabaseUrl, supabaseKey)
