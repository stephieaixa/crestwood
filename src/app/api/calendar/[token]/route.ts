import { NextRequest } from 'next/server'
import { createAdminClient, Registration } from '@/lib/supabase'
import { generateICS } from '@/lib/ics'
import { disciplineLabel } from '@/lib/sessions'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const admin = createAdminClient()
  const { data: reg } = await admin
    .from('registrations')
    .select('*')
    .eq('confirmation_token', token)
    .single<Registration>()

  if (!reg) {
    return new Response('Not found', { status: 404 })
  }

  const discipline = disciplineLabel(reg.disciplines)
  const totalPeople = reg.adults + reg.children

  const ics = generateICS({
    title: `Clase de ${discipline} - Crestwood Camp`,
    description: `Inscripcion confirmada para ${reg.name}\nParticipantes: ${totalPeople}`,
    location: 'Crestwood Camp',
    dateStr: reg.session_date,
    startHour: 17,
    durationMinutes: 60,
    uid: token,
  })

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="clase-crestwood.ics"',
    },
  })
}
