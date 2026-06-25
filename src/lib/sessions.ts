export type Discipline = 'trapecio' | 'aereos'

export interface SessionConfig {
  id: string
  dayOfWeek: number
  startTime: string
  durationMinutes: number
  label: string
}

export const SESSIONS: SessionConfig[] = [
  { id: 'tue', dayOfWeek: 2, startTime: '17:00', durationMinutes: 60, label: 'Tuesday' },
  { id: 'thu', dayOfWeek: 4, startTime: '17:00', durationMinutes: 60, label: 'Thursday' },
]

export const MAX_PER_DISCIPLINE: Record<string, number> = {
  trapecio: 10,
  aereos: 8,
}
export const CLASS_START = '2026-07-01'
export const CLASS_END   = '2026-08-19'
export const MAPS_URL    = 'https://maps.app.goo.gl/QwVmsXXfDF87SZN18'

export const DISCIPLINES: { id: Discipline; label: string; emoji: string; description?: string }[] = [
  { id: 'trapecio', label: 'Trapeze', emoji: '🎪' },
  { id: 'aereos',   label: 'Aerial Arts', emoji: '🌀', description: 'Silks, hoop & dance trapeze' },
]

export interface ClassData {
  sessionId: string
  sessionLabel: string
  startTime: string
  durationMinutes: number
  dateStr: string
  capacity: { trapecio: number; aereos: number }
}

export function getAllClassDates(): Array<{ session: SessionConfig; dateStr: string }> {
  const results: Array<{ session: SessionConfig; dateStr: string }> = []
  const [sy, sm, sd] = CLASS_START.split('-').map(Number)
  const [ey, em, ed] = CLASS_END.split('-').map(Number)
  const end = new Date(ey, em - 1, ed)

  const d = new Date(sy, sm - 1, sd)
  while (d <= end) {
    const session = SESSIONS.find(s => s.dayOfWeek === d.getDay())
    if (session) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      results.push({ session, dateStr: `${y}-${m}-${day}` })
    }
    d.setDate(d.getDate() + 1)
  }
  return results
}

// Returns array of weeks, each week is an array of ClassData (1 or 2 per week)
export function groupByWeek(
  classes: Array<{ session: SessionConfig; dateStr: string }>
): Array<Array<{ session: SessionConfig; dateStr: string }>> {
  const weekMap = new Map<string, Array<{ session: SessionConfig; dateStr: string }>>()

  for (const cls of classes) {
    const [y, m, d] = cls.dateStr.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    const dow = date.getDay()
    const daysBack = dow === 0 ? 6 : dow - 1   // days back to Monday
    const mon = new Date(y, m - 1, d - daysBack)
    const key = `${mon.getFullYear()}-${String(mon.getMonth()+1).padStart(2,'0')}-${String(mon.getDate()).padStart(2,'0')}`
    if (!weekMap.has(key)) weekMap.set(key, [])
    weekMap.get(key)!.push(cls)
  }

  return Array.from(weekMap.values())
}

export function getInitialWeekIndex(
  weeks: Array<Array<{ session: SessionConfig; dateStr: string }>>
): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  for (let i = 0; i < weeks.length; i++) {
    if (weeks[i].some(c => c.dateStr >= todayStr)) return i
  }
  return weeks.length - 1
}

export function formatDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short',
  })
}

export function weekRangeLabel(dates: string[]): string {
  if (dates.length === 0) return ''
  if (dates.length === 1) return formatDateShort(dates[0])
  return `${formatDateShort(dates[0])} – ${formatDateShort(dates[dates.length - 1])}`
}

export function disciplineLabel(disciplines: string[]): string {
  const map: Record<string, string> = { trapecio: 'Trapeze', aereos: 'Aerial Arts' }
  return disciplines.map(d => map[d] || d).join(' + ')
}
