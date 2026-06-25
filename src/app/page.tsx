import { getAllClassDates, groupByWeek, ClassData, MAPS_URL } from '@/lib/sessions'
import { createAdminClient } from '@/lib/supabase'
import WeeklyLayout from '@/components/WeeklyLayout'

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
      <header style={{ background: 'var(--green)' }} className="px-5 py-3 flex items-center">
        <img src="/logo.png" alt="Crestwood Camp" className="h-12 w-auto flex-shrink-0" />

        <div className="flex-1 text-center">
          <p
            style={{ color: 'var(--gold)', fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.12em' }}
            className="text-xl sm:text-2xl font-black uppercase italic leading-none"
          >
            Circus Hep!
          </p>
          <p className="text-green-400 text-[10px] uppercase tracking-widest mt-0.5">Aerial Arts Classes</p>
        </div>

        <div className="text-right hidden sm:block flex-shrink-0">
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight mb-3">
            Fly high with us
          </h1>
          <p className="text-green-200 text-xs sm:text-sm mb-5 whitespace-nowrap">
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

      <WeeklyLayout weeklyClasses={weeklyClasses} initialWeek={initialWeek} />

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
