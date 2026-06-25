'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase'
import { sendConfirmationEmail, sendAdminNotification } from '@/lib/email'
import { MAX_PER_DISCIPLINE } from '@/lib/sessions'

export interface RegisterEntry {
  discipline: string
  adults: number
  children: number
}

export interface RegisterPayload {
  sessionDate: string
  dayOfWeek: number
  name: string
  email: string
  entries: RegisterEntry[]
}

export async function registerForClass(data: RegisterPayload): Promise<
  { success: true; token: string } | { success: false; error: string }
> {
  const LABELS: Record<string, string> = { trapecio: 'Trapeze', aereos: 'Aerial Arts' }

  // Validate
  if (!data.name.trim()) return { success: false, error: 'Please enter your name.' }
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }
  if (data.entries.length === 0) {
    return { success: false, error: 'Please select at least one activity.' }
  }
  for (const entry of data.entries) {
    if (entry.adults + entry.children === 0) {
      return { success: false, error: `Please add at least 1 participant for ${LABELS[entry.discipline] ?? entry.discipline}.` }
    }
  }

  const admin = createAdminClient()

  // Check capacity for each discipline independently
  const { data: existing } = await admin
    .from('registrations')
    .select('disciplines, adults, children')
    .eq('session_date', data.sessionDate)
    .eq('cancelled', false)

  for (const entry of data.entries) {
    const occupied = (existing || [])
      .filter((r: { disciplines: string[] }) => r.disciplines.includes(entry.discipline))
      .reduce((sum: number, r: { adults: number; children: number }) => sum + r.adults + r.children, 0)

    const total = entry.adults + entry.children
    const remaining = (MAX_PER_DISCIPLINE[entry.discipline] ?? 10) - occupied
    if (remaining < total) {
      const label = LABELS[entry.discipline] ?? entry.discipline
      return {
        success: false,
        error: remaining <= 0
          ? `No spots left in ${label} for this date.`
          : `Only ${remaining} spot${remaining === 1 ? '' : 's'} left in ${label} for this date.`,
      }
    }
  }

  // Insert one row per entry
  let firstToken = ''
  for (const entry of data.entries) {
    const { data: reg, error: dbError } = await admin
      .from('registrations')
      .insert({
        session_date: data.sessionDate,
        day_of_week: data.dayOfWeek,
        disciplines: [entry.discipline],
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        adults: entry.adults,
        children: entry.children,
      })
      .select('confirmation_token')
      .single()

    if (dbError || !reg) {
      console.error('DB error:', dbError)
      return { success: false, error: 'Something went wrong. Please try again.' }
    }
    if (!firstToken) firstToken = reg.confirmation_token
  }

  // Send one combined email
  sendConfirmationEmail({
    to: data.email,
    name: data.name,
    sessionDate: data.sessionDate,
    entries: data.entries,
    token: firstToken,
  }).catch(console.error)

  sendAdminNotification({
    name: data.name,
    email: data.email,
    sessionDate: data.sessionDate,
    entries: data.entries,
  }).catch(console.error)

  revalidatePath('/')
  return { success: true, token: firstToken }
}
