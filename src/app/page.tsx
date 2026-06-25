import { getAllClassDates, groupByWeek, ClassData, MAPS_URL } from '@/lib/sessions'
import { createAdminClient } from '@/lib/supabase'
import ClassesSection from '@/components/ClassesSection'

export const dynamic = 'force-dynamic'

async function getCapacities(dateStrs: string[]): Promise<Record<string, { trapecio: number; aereos: number }>> {
  if (dateStrs.length === 0) return {}

  const admin = createAdminClient()
  const { data } = await admin
    .from('registrations')
    .select('session_date, disciplines, adults, children')
    .in('session_date', dateStrs)
    .eq('cancelled', false)

  const result: Record<string, { trapecio: number; aereos: number }> = {}
  for (const d of dateStrs) result[d] = { trapecio: 0, aereos: 0 }

  for (const row of (data || [])) {
    const cap = result[row.session_date]
    if (!cap) continue
    const people = (row.adults as number) + (row.children as number)
    if ((row.disciplines as string[]).includes('trapecio')) cap.trapecio += people
    if ((row.disciplines as string[]).includes('aereos')) cap.aereos += people
  }

  return result
}

export default async function Home() {
  const allDates = getAllClassDates()
  const dateStrs = allDates.map(u => u.dateStr)
  const capacities = await getCapacities(dateStrs)

  const allClasses: ClassData[] = allDates.map(({ session, dateStr }) => ({
    sessionId: session.id,
    sessionLabel: session.label,
    startTime: session.startTime,
    durationMinutes: session.durationMinutes,
    dateStr,
    capacity: capacities[dateStr] || { trapecio: 0, aereos: 0 },
  }))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const rawWeeks = groupByWeek(allDates)
  // Only keep weeks that have at least one class today or in the future
  const futureWeeks = rawWeeks.filter(week => week.some(c => c.dateStr >= todayStr))

  const weeklyClasses: ClassData[][] = futureWeeks.map(week =>
    week.map(({ session, dateStr }) => ({
      sessionId: session.id,
      sessionLabel: session.label,
      startTime: session.startTime,
      durationMinutes: session.durationMinutes,
      dateStr,
      capacity: capacities[dateStr] || { trapecio: 0, aereos: 0 },
    }))
  )
  const initialWeek = 0

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <header style={{ background: 'var(--green)' }} className="px-5 py-4 flex items-center gap-3">
        <div className="text-3xl">🎪</div>
        <div>
          <div className="text-white font-black text-xl tracking-tight leading-none">CRESTWOOD</div>
          <div style={{ color: 'var(--gold)' }} className="text-xs font-semibold uppercase tracking-widest">
            Aerial Arts Classes
          </div>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <p className="text-green-300 text-xs">Contact</p>
          <a
            href="mailto:circusworldlife@gmail.com"
            className="text-white text-xs hover:text-[#F5C842] transition-colors"
          >
            circusworldlife@gmail.com
          </a>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{ background: 'linear-gradient(160deg, #1B4D1B 0%, #2D6A2D 60%, #3a7a3a 100%)' }}
        className="px-5 py-8 text-center"
      >
        <div className="max-w-lg mx-auto">
          <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight mb-3">
            Fly high with us
          </h1>
          <p className="text-green-200 text-sm mb-5 leading-relaxed">
            Trapeze & Aerial Arts for all ages · No experience needed · Wear comfortable clothes
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-green-100 bg-white/10 rounded-full px-3 py-1.5">
              <span>📅</span> Tuesdays & Thursdays
            </span>
            <span className="flex items-center gap-1.5 text-xs text-green-100 bg-white/10 rounded-full px-3 py-1.5">
              <span>🕔</span> 5:00 – 6:00 PM
            </span>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-green-100 bg-white/10 rounded-full px-3 py-1.5 hover:bg-white/20 transition-colors"
            >
              <span>📍</span> Crestwood Camp
            </a>
          </div>
        </div>
      </section>

      {/* Info section */}
      <section className="px-5 pt-8 pb-2 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-[#1B4D1B] text-base mb-4">How it works</h3>
          <div className="space-y-3">
            {[
              { n: '1', t: 'Pick a class', d: 'Choose the day that works best for you.' },
              { n: '2', t: 'Reserve your spot', d: 'Fill out the form with your details.' },
              { n: '3', t: 'Get confirmed', d: 'We\'ll email you all the details and a calendar file to save the date.' },
              { n: '4', t: 'Time to fly!', d: 'We\'ll send you a reminder the day before. Just wear comfortable clothes.' },
            ].map(step => (
              <div key={step.n} className="flex items-start gap-3">
                <div
                  style={{ background: 'var(--green)', color: 'var(--gold)' }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                >
                  {step.n}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{step.t}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classes */}
      <ClassesSection weeklyClasses={weeklyClasses} initialWeek={initialWeek} />

      {/* Footer */}
      <footer style={{ background: 'var(--green)' }} className="mt-auto px-5 py-6 text-center">
        <p className="text-green-300 text-xs">
          Crestwood Camp &bull; Aerial Arts Classes
        </p>
        <a
          href="mailto:circusworldlife@gmail.com"
          style={{ color: 'var(--gold)' }}
          className="text-xs mt-1 block hover:underline"
        >
          circusworldlife@gmail.com
        </a>
      </footer>
    </div>
  )
}
