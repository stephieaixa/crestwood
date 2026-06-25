export type Discipline = 'trapecio' | 'aereos'

export interface SessionConfig {
  id: string
  dayOfWeek: number // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu
  startTime: string // "17:00"
  durationMinutes: number
  label: string
}

export const SESSIONS: SessionConfig[] = [
  { id: 'tue', dayOfWeek: 2, startTime: '17:00', durationMinutes: 60, label: 'Martes' },
  { id: 'thu', dayOfWeek: 4, startTime: '17:00', durationMinutes: 60, label: 'Jueves' },
]

export const MAX_PER_DISCIPLINE = 10

export const DISCIPLINES: { id: Discipline; label: string; emoji: string }[] = [
  { id: 'trapecio', label: 'Trapecio', emoji: '🎪' },
  { id: 'aereos', label: 'Aereos', emoji: '🌀' },
]

export interface ClassData {
  sessionId: string
  sessionLabel: string
  startTime: string
  durationMinutes: number
  dateStr: string
  capacity: { trapecio: number; aereos: number }
}

export function getUpcomingDates(weeksAhead = 3): Array<{ session: SessionConfig; dateStr: string }> {
  const results: Array<{ session: SessionConfig; dateStr: string }> = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i <= weeksAhead * 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const session = SESSIONS.find(s => s.dayOfWeek === d.getDay())
    if (session) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      results.push({ session, dateStr: `${y}-${m}-${day}` })
    }
    if (results.length >= 4) break
  }

  return results
}

export function formatDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export function disciplineLabel(disciplines: string[]): string {
  const map: Record<string, string> = { trapecio: 'Trapecio', aereos: 'Aereos' }
  return disciplines.map(d => map[d] || d).join(' + ')
}
