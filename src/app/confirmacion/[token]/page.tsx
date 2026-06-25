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
    reg.adults > 0 ? `${reg.adults} adult${reg.adults > 1 ? 's' : ''}` : '',
    reg.children > 0 ? `${reg.children} child${reg.children > 1 ? 'ren' : ''}` : '',
  ].filter(Boolean).join(' + ')

  const gcalUrl = googleCalendarUrl({
    title: `${discipline} Class — Crestwood Camp`,
    description: `Registration confirmed for ${reg.name}. Discipline: ${discipline}. Participants: ${peopleDesc}.`,
    location: 'Crestwood Camp',
    dateStr: reg.session_date,
  })

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <header style={{ background: 'var(--green)' }} className="px-5 py-3 flex items-center">
        <img src="/logo.png" alt="Crestwood Camp" className="h-12 w-auto" />
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
              You're registered!
            </h1>
            <p className="text-green-200 text-sm capitalize">{dateFormatted}</p>
          </div>

          {/* Details card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <h2 className="font-bold text-[#1B4D1B] mb-4">Class details</h2>
            <div className="space-y-3">
              {[
                { label: 'Name', value: reg.name },
                { label: 'Date', value: <span className="capitalize">{dateFormatted}</span> },
                { label: 'Time', value: '5:00 PM – 6:00 PM' },
                { label: 'Location', value: 'Crestwood Camp' },
                { label: 'Discipline', value: (
                  <span
                    style={{ background: 'var(--green)', color: 'var(--gold)' }}
                    className="rounded-full px-3 py-0.5 text-xs font-bold"
                  >
                    {discipline}
                  </span>
                )},
                { label: 'Participants', value: `${peopleDesc} (${totalPeople} total)` },
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
            <h2 className="font-bold text-[#1B4D1B] mb-1">Add to calendar</h2>
            <p className="text-xs text-gray-400 mb-4">
              We also attached the calendar file to your confirmation email.
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
                  <p className="text-xs text-gray-400">Download .ics file</p>
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
                  <p className="text-xs text-gray-400">Opens in a new tab</p>
                </div>
                <span className="ml-auto text-gray-300 group-hover:text-[#1B4D1B]">→</span>
              </a>
            </div>
          </div>

          {/* Reminder note */}
          <div className="rounded-xl bg-[#e8f5e8] border border-[#c8e6c8] px-4 py-3 flex items-start gap-3 mb-6">
            <span className="text-lg">🔔</span>
            <p className="text-sm text-[#1B4D1B]">
              We'll send a reminder to <strong>{reg.email}</strong> the day before your class.
            </p>
          </div>

          {/* Back */}
          <a
            href="/"
            className="block text-center text-sm text-gray-400 hover:text-[#1B4D1B] transition-colors"
          >
            ← Back to home
          </a>
        </div>
      </main>

      <footer style={{ background: 'var(--green)' }} className="px-5 py-4 text-center">
        <p className="text-green-300 text-xs">Crestwood Camp &bull; circusworldlife@gmail.com</p>
      </footer>
    </div>
  )
}
