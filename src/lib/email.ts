import { Resend } from 'resend'
import { generateICS } from './ics'
import { disciplineLabel, formatDateLong } from './sessions'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Crestwood Classes <onboarding@resend.dev>'
const ADMIN_EMAIL = 'circusworldlife@gmail.com'

const GREEN = '#1B4D1B'
const GOLD = '#F5C842'
const CREAM = '#F8F5EE'
const GREEN_LIGHT = '#a8d5a2'

function peopleDesc(adults: number, children: number): string {
  const parts = [
    adults > 0 ? `${adults} adult${adults > 1 ? 's' : ''}` : '',
    children > 0 ? `${children} child${children > 1 ? 'ren' : ''}` : '',
  ].filter(Boolean)
  return parts.join(' + ')
}

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Crestwood Classes</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0" role="presentation">
          <!-- Logo bar -->
          <tr>
            <td style="background:${GREEN};border-radius:16px 16px 0 0;padding:24px 28px;text-align:center;">
              <p style="margin:0;font-size:32px;">🎪</p>
              <p style="margin:6px 0 0;color:${GOLD};font-size:20px;font-weight:800;letter-spacing:1px;">CRESTWOOD</p>
              <p style="margin:4px 0 0;color:${GREEN_LIGHT};font-size:12px;letter-spacing:2px;text-transform:uppercase;">Aerial Arts Classes</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px 28px;border-left:1px solid #e8e0d5;border-right:1px solid #e8e0d5;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:${GREEN};border-radius:0 0 16px 16px;padding:18px 28px;text-align:center;">
              <p style="margin:0;color:${GREEN_LIGHT};font-size:12px;">
                Crestwood Camp &bull; Aerial Arts &bull;
                <a href="mailto:circusworldlife@gmail.com" style="color:${GOLD};text-decoration:none;">circusworldlife@gmail.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="color:#888;font-size:13px;padding:7px 0;border-bottom:1px solid #f0ece5;width:40%;">${label}</td>
    <td style="font-weight:600;font-size:14px;color:#1a1a1a;text-align:right;padding:7px 0;border-bottom:1px solid #f0ece5;">${value}</td>
  </tr>`
}

// ─── Confirmation email to registrant ────────────────────────────────────────

export async function sendConfirmationEmail({
  to, name, sessionDate, disciplines, adults, children, token,
}: {
  to: string; name: string; sessionDate: string; disciplines: string[]
  adults: number; children: number; token: string
}) {
  const discipline = disciplineLabel(disciplines)
  const dateFormatted = formatDateLong(sessionDate)
  const people = peopleDesc(adults, children)
  const total = adults + children

  const icsContent = generateICS({
    title: `${discipline} Class — Crestwood Camp`,
    description: `Confirmed class for ${name}\\nDiscipline: ${discipline}\\nParticipants: ${people}`,
    location: 'Crestwood Camp',
    dateStr: sessionDate,
    startHour: 17,
    durationMinutes: 60,
    uid: token,
  })

  const body = `
    <h2 style="margin:0 0 6px;color:${GREEN};font-size:22px;font-weight:800;">You're all set, ${name}! 🎉</h2>
    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
      Your spot is confirmed. We can't wait to see you fly!
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-radius:12px;padding:4px 16px;margin-bottom:24px;">
      <tbody>
        ${detailRow('Date', `<span style="text-transform:capitalize;">${dateFormatted}</span>`)}
        ${detailRow('Time', '5:00 PM – 6:00 PM')}
        ${detailRow('Location', 'Crestwood Camp')}
        ${detailRow('Discipline', `<span style="background:${GREEN};color:${GOLD};border-radius:20px;padding:2px 10px;font-size:12px;">${discipline}</span>`)}
        ${detailRow('Participants', `${people} &nbsp;<span style="color:#aaa;font-weight:400;">(${total} total)</span>`)}
      </tbody>
    </table>

    <div style="background:#fffbea;border:1px solid #f0d060;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#7a5f00;line-height:1.6;">
        <strong>📎 Calendar file attached</strong> — open the .ics attachment to add this class to your calendar automatically.
      </p>
    </div>

    <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
      You'll receive a reminder the day before your class. See you there — wear comfortable clothes and bring your energy! 🚀
    </p>
  `

  await resend.emails.send({
    from: FROM,
    to: [to],
    subject: `You're confirmed! ${discipline} class on ${dateFormatted}`,
    html: baseLayout(body),
    attachments: [{ filename: 'crestwood-class.ics', content: Buffer.from(icsContent) }],
  })
}

// ─── Admin notification ───────────────────────────────────────────────────────

export async function sendAdminNotification({
  name, email, sessionDate, disciplines, adults, children,
}: {
  name: string; email: string; sessionDate: string; disciplines: string[]
  adults: number; children: number
}) {
  const discipline = disciplineLabel(disciplines)
  const dateFormatted = formatDateLong(sessionDate)
  const people = peopleDesc(adults, children)
  const total = adults + children

  const body = `
    <h2 style="margin:0 0 6px;color:${GREEN};font-size:20px;font-weight:800;">New registration received</h2>
    <p style="margin:0 0 24px;color:#555;font-size:14px;">Someone just signed up for a class at Crestwood Camp.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-radius:12px;padding:4px 16px;margin-bottom:20px;">
      <tbody>
        ${detailRow('Name', name)}
        ${detailRow('Email', `<a href="mailto:${email}" style="color:${GREEN};">${email}</a>`)}
        ${detailRow('Date', `<span style="text-transform:capitalize;">${dateFormatted}</span>`)}
        ${detailRow('Time', '5:00 PM – 6:00 PM')}
        ${detailRow('Discipline', `<span style="background:${GREEN};color:${GOLD};border-radius:20px;padding:2px 10px;font-size:12px;">${discipline}</span>`)}
        ${detailRow('Participants', `${people} (${total} total)`)}
      </tbody>
    </table>
  `

  await resend.emails.send({
    from: FROM,
    to: [ADMIN_EMAIL],
    subject: `New signup: ${name} — ${discipline} on ${dateFormatted}`,
    html: baseLayout(body),
  })
}

// ─── Reminder email (sent day before) ────────────────────────────────────────

export async function sendReminderEmail({
  to, name, sessionDate, disciplines, adults, children,
}: {
  to: string; name: string; sessionDate: string; disciplines: string[]
  adults: number; children: number
}) {
  const discipline = disciplineLabel(disciplines)
  const dateFormatted = formatDateLong(sessionDate)
  const total = adults + children

  const body = `
    <h2 style="margin:0 0 6px;color:${GREEN};font-size:22px;font-weight:800;">Your class is tomorrow! 🤸</h2>
    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
      Hey ${name}, just a quick reminder that you have a class at Crestwood Camp tomorrow.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-radius:12px;padding:4px 16px;margin-bottom:24px;">
      <tbody>
        ${detailRow('Date', `<span style="text-transform:capitalize;">${dateFormatted}</span>`)}
        ${detailRow('Time', '5:00 PM – 6:00 PM')}
        ${detailRow('Location', 'Crestwood Camp')}
        ${detailRow('Discipline', `<span style="background:${GREEN};color:${GOLD};border-radius:20px;padding:2px 10px;font-size:12px;">${discipline}</span>`)}
        ${detailRow('Participants', `${total} total`)}
      </tbody>
    </table>

    <div style="background:#e8f5e8;border:1px solid #c8e6c8;border-radius:10px;padding:14px 16px;">
      <p style="margin:0;font-size:13px;color:${GREEN};line-height:1.6;">
        <strong>What to bring:</strong> Comfortable clothes, water, and lots of enthusiasm. We'll take care of the rest!
      </p>
    </div>
  `

  await resend.emails.send({
    from: FROM,
    to: [to],
    subject: `Reminder: ${discipline} class tomorrow at 5 PM — Crestwood Camp`,
    html: baseLayout(body),
  })
}
