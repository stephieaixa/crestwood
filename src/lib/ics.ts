export function generateICS({
  title,
  description,
  location,
  dateStr,
  startHour,
  durationMinutes,
  uid,
}: {
  title: string
  description: string
  location: string
  dateStr: string
  startHour: number
  durationMinutes: number
  uid: string
}): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const pad = (n: number) => String(n).padStart(2, '0')
  const endHour = startHour + Math.floor(durationMinutes / 60)
  const endMin = durationMinutes % 60

  const start = `${y}${pad(m)}${pad(d)}T${pad(startHour)}0000`
  const end = `${y}${pad(m)}${pad(d)}T${pad(endHour)}${pad(endMin)}00`
  const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Crestwood Clases//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@crestwood`,
    `DTSTART;TZID=America/Argentina/Buenos_Aires:${start}`,
    `DTEND;TZID=America/Argentina/Buenos_Aires:${end}`,
    `DTSTAMP:${stamp}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Recordatorio: ${title} manana a las 17hs`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.join('\r\n')
}

export function googleCalendarUrl({
  title,
  description,
  location,
  dateStr,
}: {
  title: string
  description: string
  location: string
  dateStr: string
}): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const pad = (n: number) => String(n).padStart(2, '0')
  const start = `${y}${pad(m)}${pad(d)}T170000`
  const end = `${y}${pad(m)}${pad(d)}T180000`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: description,
    location,
  })

  return `https://calendar.google.com/calendar/render?${params}`
}
