import { NextRequest } from 'next/server'
import { createAdminClient, Registration } from '@/lib/supabase'
import { sendReminderEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const y = tomorrow.getFullYear()
  const m = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const d = String(tomorrow.getDate()).padStart(2, '0')
  const tomorrowStr = `${y}-${m}-${d}`

  const admin = createAdminClient()
  const { data: registrations } = await admin
    .from('registrations')
    .select('*')
    .eq('session_date', tomorrowStr)
    .eq('cancelled', false)
    .eq('reminder_sent', false)

  let sent = 0
  for (const reg of ((registrations || []) as Registration[])) {
    try {
      await sendReminderEmail({
        to: reg.email,
        name: reg.name,
        sessionDate: reg.session_date,
        disciplines: reg.disciplines,
        adults: reg.adults,
        children: reg.children,
      })
      await admin
        .from('registrations')
        .update({ reminder_sent: true })
        .eq('id', reg.id)
      sent++
    } catch (err) {
      console.error(`Failed reminder for ${reg.email}:`, err)
    }
  }

  return Response.json({ date: tomorrowStr, sent })
}
