'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase'
import { sendConfirmationEmail, sendAdminNotification } from '@/lib/email'
import { MAX_PER_DISCIPLINE } from '@/lib/sessions'

export interface RegisterPayload {
  sessionDate: string
  dayOfWeek: number
  disciplines: string[]
  name: string
  email: string
  adults: number
  children: number
}

export async function registerForClass(data: RegisterPayload): Promise<
  { success: true; token: string } | { success: false; error: string }
> {
  // Validate
  if (!data.name.trim()) return { success: false, error: 'Please enter your name.' }
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }
  if (data.disciplines.length === 0) {
    return { success: false, error: 'Please select at least one discipline.' }
  }
  if (data.adults + data.children === 0) {
    return { success: false, error: 'Please add at least 1 participant.' }
  }

  const admin = createAdminClient()
  const totalPeople = data.adults + data.children

  // Check capacity per discipline
  const { data: existing } = await admin
    .from('registrations')
    .select('disciplines, adults, children')
    .eq('session_date', data.sessionDate)
    .eq('cancelled', false)

  for (const discipline of data.disciplines) {
    const occupied = (existing || [])
      .filter((r: { disciplines: string[] }) => r.disciplines.includes(discipline))
      .reduce((sum: number, r: { adults: number; children: number }) => sum + r.adults + r.children, 0)

    const remaining = (MAX_PER_DISCIPLINE[discipline] ?? 10) - occupied
    if (remaining < totalPeople) {
      const label = discipline === 'trapecio' ? 'Trapeze' : 'Aerial Arts'
      return {
        success: false,
        error: remaining <= 0
          ? `No spots left in ${label} for this date.`
          : `Only ${remaining} spot${remaining === 1 ? '' : 's'} left in ${label} for this date.`,
      }
    }
  }

  // Insert registration
  const { data: reg, error: dbError } = await admin
    .from('registrations')
    .insert({
      session_date: data.sessionDate,
      day_of_week: data.dayOfWeek,
      disciplines: data.disciplines,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      adults: data.adults,
      children: data.children,
    })
    .select('confirmation_token')
    .single()

  if (dbError || !reg) {
    console.error('DB error:', dbError)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  const token = reg.confirmation_token

  // Send emails in background (don't block response)
  sendConfirmationEmail({
    to: data.email,
    name: data.name,
    sessionDate: data.sessionDate,
    disciplines: data.disciplines,
    adults: data.adults,
    children: data.children,
    token,
  }).catch(console.error)

  sendAdminNotification({
    name: data.name,
    email: data.email,
    sessionDate: data.sessionDate,
    disciplines: data.disciplines,
    adults: data.adults,
    children: data.children,
  }).catch(console.error)

  revalidatePath('/')

  return { success: true, token }
}
