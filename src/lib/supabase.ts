import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface Registration {
  id: string
  session_date: string
  day_of_week: number
  disciplines: string[]
  name: string
  email: string
  adults: number
  children: number
  confirmation_token: string
  reminder_sent: boolean
  cancelled: boolean
  created_at: string
}
