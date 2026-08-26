'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { AGENT_EMAILS, HOUSE_EMAIL, FROM_EMAIL } from '@/lib/agentEmails'
import { HONEYPOT_FIELD, type InquiryState } from '@/lib/inquiry'

const LIMITS: Record<string, number> = {
  name: 120, email: 200, phone: 60, travelers: 120,
  destination: 200, travel_date: 120, budget: 120, message: 5000,
}

function field(fd: FormData, key: string): string {
  const raw = fd.get(key)
  return typeof raw === 'string' ? raw.trim().slice(0, LIMITS[key] ?? 200) : ''
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function row(label: string, value: string) {
  if (!value) return ''
  return `<tr>
    <td style="padding:6px 16px 6px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td>
    <td style="padding:6px 0;color:#0f172a;font-size:14px">${escapeHtml(value)}</td>
  </tr>`
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

/**
 * Handles both the homepage/contact intake form and the per-agent contact forms.
 *
 * Security note: this is a public, unauthenticated endpoint reachable by direct
 * POST, so it never accepts a recipient address from the caller. The client sends
 * an agent *slug*; the address is resolved here against the `agents` table. That
 * means the worst a forged request can do is mail an agent who already receives
 * inquiries — not use us as an open relay, which is what the previous client-side
 * EmailJS setup allowed.
 */
export async function submitInquiry(formData: FormData): Promise<InquiryState> {
  // Bots fill every field they find; real users never see this one.
  if (field(formData, HONEYPOT_FIELD)) return { ok: true, error: null }

  const name = field(formData, 'name')
  const email = field(formData, 'email')
  if (!name) return { ok: false, error: 'Please enter your name.' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Please enter a valid email address.' }

  const slug = field(formData, 'agent') || 'any'
  const source = field(formData, 'source') === 'agent_page' ? 'agent_page' : 'intake'

  const admin = createAdminClient()

  // Resolve the recipient server-side. AGENT_EMAILS wins when an agent's public
  // inbox differs from the login email on their row, mirroring lib/intakeAgents.
  let agentId: string | null = null
  let agentName = 'the team'
  let recipient = HOUSE_EMAIL

  if (slug !== 'any') {
    const { data } = await admin
      .from('agents').select('id, full_name, email').eq('slug', slug).single()
    if (data) {
      agentId = data.id as string
      agentName = data.full_name as string
      recipient = AGENT_EMAILS[slug] || (data.email as string) || HOUSE_EMAIL
    } else {
      recipient = AGENT_EMAILS[slug] || HOUSE_EMAIL
    }
  }

  const payload = {
    agent_id: agentId,
    agent_slug: slug,
    recipient_email: recipient,
    name,
    email,
    phone: field(formData, 'phone') || null,
    travelers: field(formData, 'travelers') || null,
    destination: field(formData, 'destination') || null,
    travel_date: field(formData, 'travel_date') || null,
    budget: field(formData, 'budget') || null,
    message: field(formData, 'message') || null,
    source,
  }

  // Record the lead first so it survives a delivery failure.
  const { data: inserted, error: insertError } = await admin
    .from('inquiries').insert(payload).select('id').single()

  if (insertError) {
    console.error('[inquiry] insert failed', insertError.message)
  }
  const inquiryId = inserted?.id as string | undefined

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[inquiry] RESEND_API_KEY is not set — inquiry saved but not emailed')
    if (inquiryId) await markEmail(admin, inquiryId, 'failed', 'RESEND_API_KEY missing', null)
    return { ok: false, error: 'We saved your request but could not send it just yet. Please email us directly.' }
  }

  const subject = `New inquiry from ${name} — PAC and GO Travel`
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px">
      <p style="font-size:15px;color:#0f172a">
        You have a new inquiry from the PAC and GO Travel website${agentId ? ` for ${escapeHtml(agentName)}` : ''}.
      </p>
      <table style="border-collapse:collapse;margin:16px 0">
        ${row('Name', name)}
        ${row('Email', email)}
        ${row('Phone', payload.phone || '')}
        ${row('Travelers', payload.travelers || '')}
        ${row('Destination', payload.destination || '')}
        ${row('Travel dates', payload.travel_date || '')}
        ${row('Budget', payload.budget || '')}
      </table>
      ${payload.message ? `<p style="font-size:14px;color:#0f172a;white-space:pre-wrap">${escapeHtml(payload.message)}</p>` : ''}
      <p style="font-size:12px;color:#94a3b8;margin-top:24px">
        Reply to this email to respond directly to ${escapeHtml(name)}.
      </p>
    </div>`

  // Resend derives a plaintext alternative from the HTML when none is given, and
  // it flattens the detail table onto one unreadable line. Supply our own.
  const textLines = [
    `You have a new inquiry from the PAC and GO Travel website${agentId ? ` for ${agentName}` : ''}.`,
    '',
    `Name:         ${name}`,
    `Email:        ${email}`,
    payload.phone       ? `Phone:        ${payload.phone}` : '',
    payload.travelers   ? `Travelers:    ${payload.travelers}` : '',
    payload.destination ? `Destination:  ${payload.destination}` : '',
    payload.travel_date ? `Travel dates: ${payload.travel_date}` : '',
    payload.budget      ? `Budget:       ${payload.budget}` : '',
    payload.message     ? `\n${payload.message}` : '',
    '',
    `Reply to this email to respond directly to ${name}.`,
  ].filter(l => l !== '')
  const text = textLines.join('\n')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [recipient],
        reply_to: email,
        subject,
        html,
        text,
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error('[inquiry] resend failed', res.status, detail)
      if (inquiryId) await markEmail(admin, inquiryId, 'failed', `${res.status} ${detail}`.slice(0, 500), null)
      return { ok: false, error: 'Something went wrong sending your inquiry — please try again or email us directly.' }
    }

    const body = (await res.json()) as { id?: string }
    if (inquiryId) await markEmail(admin, inquiryId, 'sent', null, body.id ?? null)
    return { ok: true, error: null }
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    console.error('[inquiry] resend threw', detail)
    if (inquiryId) await markEmail(admin, inquiryId, 'failed', detail.slice(0, 500), null)
    return { ok: false, error: 'Something went wrong sending your inquiry — please try again or email us directly.' }
  }
}

async function markEmail(
  admin: ReturnType<typeof createAdminClient>,
  id: string,
  status: 'sent' | 'failed',
  error: string | null,
  providerId: string | null
) {
  const { error: e } = await admin
    .from('inquiries')
    .update({ email_status: status, email_error: error, provider_id: providerId })
    .eq('id', id)
  if (e) console.error('[inquiry] status update failed', e.message)
}
