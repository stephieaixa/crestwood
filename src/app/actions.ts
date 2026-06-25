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
  if (!data.name.trim()) return { success: false, error: 'Por favor ingresa tu nombre.' }
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { success: false, error: 'El email no es valido.' }
  }
  if (data.disciplines.length === 0) {
    return { success: false, error: 'Selecciona al menos una disciplina.' }
  }
  if (data.adults + data.children === 0) {
    return { success: false, error: 'Agrega al menos 1 participante.' }
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

    const remaining = MAX_PER_DISCIPLINE - occupied
    if (remaining < totalPeople) {
      const label = discipline === 'trapecio' ? 'Trapecio' : 'Aereos'
      return {
        success: false,
        error: remaining <= 0
          ? `No quedan lugares en ${label} para esta fecha.`
          : `Solo quedan ${remaining} lugar${remaining === 1 ? '' : 'es'} en ${label} para esta fecha.`,
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
    return { success: false, error: 'Ocurrio un error. Por favor intenta de nuevo.' }
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
