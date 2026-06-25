import { notFound } from 'next/navigation'
import { createAdminClient, Registration } from '@/lib/supabase'
import { disciplineLabel, formatDateLong } from '@/lib/sessions'
import { googleCalendarUrl } from '@/lib/ics'

interface Props {
  params: Promise<{ token: string }>
}

export default async function ConfirmacionPage({ params }: Props) {
  const { token } = await params

  const admin = createAdminClient()
  const { data: reg } = await admin
    .from('registrations')
    .select('*')
    .eq('confirmation_token', token)
    .single<Registration>()

  if (!reg) notFound()

  const discipline = disciplineLabel(reg.disciplines)
  const dateFormatted = formatDateLong(reg.session_date)
  const totalPeople = reg.adults + reg.children

  const peopleDesc = [
    reg.adults > 0 ? `${reg.adults} adulto${reg.adults > 1 ? 's' : ''}` : '',
    reg.children > 0 ? `${reg.children} nino${reg.children > 1 ? 's' : ''}` : '',
  ].filter(Boolean).join(' + ')

  const gcalUrl = googleCalendarUrl({
    title: `Clase de ${discipline} - Crestwood Camp`,
    description: `Inscripcion confirmada para ${reg.name}. Disciplina: ${discipline}. Participantes: ${peopleDesc}.`,
    location: 'Crestwood Camp',
    dateStr: reg.session_date,
  })

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <header style={{ background: 'var(--green)' }} className="px-5 py-4 flex items-center gap-3">
        <div className="text-3xl">🎪</div>
        <div>
          <div className="text-white font-black text-xl tracking-tight leading-none">CRESTWOOD</div>
          <div style={{ color: 'var(--gold)' }} className="text-xs font-semibold uppercase tracking-widest">
            Acrobacia Aerea
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md animate-slide-up">
          {/* Success banner */}
          <div
            style={{ background: 'var(--green)' }}
            className="rounded-2xl p-8 text-center text-white mb-5"
          >
            <div className="text-5xl mb-4">🎉</div>
            <h1 style={{ color: 'var(--gold)' }} className="text-2xl font-black mb-2">
              Inscripcion confirmada!
            </h1>
            <p className="text-green-200 text-sm capitalize">{dateFormatted}</p>
          </div>

          {/* Details card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <h2 className="font-bold text-[#1B4D1B] mb-4">Detalles de tu clase</h2>
            <div className="space-y-3">
              {[
                { label: 'Nombre', value: reg.name },
                { label: 'Fecha', value: <span className="capitalize">{dateFormatted}</span> },
                { label: 'Horario', value: '17:00 - 18:00 hs' },
                { label: 'Lugar', value: 'Crestwood Camp' },
                { label: 'Disciplina', value: (
                  <span
                    style={{ background: 'var(--green)', color: 'var(--gold)' }}
                    className="rounded-full px-3 py-0.5 text-xs font-bold"
                  >
                    {discipline}
                  </span>
                )},
                { label: 'Participantes', value: `${peopleDesc} (${totalPeople} total)` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <h2 className="font-bold text-[#1B4D1B] mb-1">Agregar al calendario</h2>
            <p className="text-xs text-gray-400 mb-4">
              Tambien te enviamos el archivo adjunto en el email de confirmacion.
            </p>
            <div className="space-y-2">
              <a
                href={`/api/calendar/${token}`}
                download="clase-crestwood.ics"
                className="flex items-center gap-3 w-full border border-gray-200 rounded-xl px-4 py-3 hover:border-[#1B4D1B] hover:bg-[#f0f9f0] transition-all group"
              >
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#1B4D1B]">
                    Apple / Outlook Calendar
                  </p>
                  <p className="text-xs text-gray-400">Descarga archivo .ics</p>
                </div>
                <span className="ml-auto text-gray-300 group-hover:text-[#1B4D1B]">↓</span>
              </a>

              <a
                href={gcalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full border border-gray-200 rounded-xl px-4 py-3 hover:border-[#1B4D1B] hover:bg-[#f0f9f0] transition-all group"
              >
                <span className="text-xl">📆</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#1B4D1B]">
                    Google Calendar
                  </p>
                  <p className="text-xs text-gray-400">Abre en una nueva pestana</p>
                </div>
                <span className="ml-auto text-gray-300 group-hover:text-[#1B4D1B]">→</span>
              </a>
            </div>
          </div>

          {/* Reminder note */}
          <div className="rounded-xl bg-[#e8f5e8] border border-[#c8e6c8] px-4 py-3 flex items-start gap-3 mb-6">
            <span className="text-lg">🔔</span>
            <p className="text-sm text-[#1B4D1B]">
              Te vamos a enviar un recordatorio a <strong>{reg.email}</strong> el dia anterior a la clase.
            </p>
          </div>

          {/* Back */}
          <a
            href="/"
            className="block text-center text-sm text-gray-400 hover:text-[#1B4D1B] transition-colors"
          >
            ← Volver al inicio
          </a>
        </div>
      </main>

      <footer style={{ background: 'var(--green)' }} className="px-5 py-4 text-center">
        <p className="text-green-300 text-xs">Crestwood Camp &bull; circusworldlife@gmail.com</p>
      </footer>
    </div>
  )
}
