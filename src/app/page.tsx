import { getUpcomingDates, ClassData } from '@/lib/sessions'
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
  const upcoming = getUpcomingDates(3)
  const dateStrs = upcoming.map(u => u.dateStr)
  const capacities = await getCapacities(dateStrs)

  const classes: ClassData[] = upcoming.map(({ session, dateStr }) => ({
    sessionId: session.id,
    sessionLabel: session.label,
    startTime: session.startTime,
    durationMinutes: session.durationMinutes,
    dateStr,
    capacity: capacities[dateStr] || { trapecio: 0, aereos: 0 },
  }))

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <header style={{ background: 'var(--green)' }} className="px-5 py-4 flex items-center gap-3">
        <div className="text-3xl">🎪</div>
        <div>
          <div className="text-white font-black text-xl tracking-tight leading-none">CRESTWOOD</div>
          <div style={{ color: 'var(--gold)' }} className="text-xs font-semibold uppercase tracking-widest">
            Acrobacia Aerea
          </div>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <p className="text-green-300 text-xs">Consultas</p>
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
        className="px-5 py-14 text-center"
      >
        <div className="max-w-lg mx-auto">
          <p
            style={{ color: 'var(--gold)' }}
            className="text-xs font-bold uppercase tracking-widest mb-4"
          >
            pure joy!
          </p>
          <h1 className="text-white text-4xl sm:text-5xl font-black leading-tight mb-4">
            Vola alto<br />con nosotros
          </h1>
          <p className="text-green-200 text-base mb-6 leading-relaxed">
            Clases de Trapecio y Aereos para todas las edades.<br />
            Un espacio para conectar con las alturas.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: '📅', text: 'Martes y Jueves' },
              { icon: '🕔', text: '17:00 - 18:00 hs' },
              { icon: '📍', text: 'Crestwood Camp' },
              { icon: '👥', text: 'Max 10 personas' },
            ].map(({ icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-1.5 text-sm text-green-100 bg-white/10 rounded-full px-3 py-1.5"
              >
                <span>{icon}</span> {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Classes */}
      <ClassesSection classes={classes} />

      {/* Info section */}
      <section className="px-5 pb-10 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-[#1B4D1B] text-base mb-4">Como funciona?</h3>
          <div className="space-y-3">
            {[
              { n: '1', t: 'Elegi tu clase', d: 'Selecciona el dia que mejor te quede.' },
              { n: '2', t: 'Reserva tu lugar', d: 'Completa el formulario con tus datos.' },
              { n: '3', t: 'Recibe confirmacion', d: 'Te enviamos un email con todos los detalles y un archivo para agregar al calendario.' },
              { n: '4', t: 'A volar!', d: 'El dia anterior te recordamos la clase. Solo trае ropa comoda.' },
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

      {/* Footer */}
      <footer style={{ background: 'var(--green)' }} className="mt-auto px-5 py-6 text-center">
        <p className="text-green-300 text-xs">
          Crestwood Camp &bull; Clases de Acrobacia Aerea
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
