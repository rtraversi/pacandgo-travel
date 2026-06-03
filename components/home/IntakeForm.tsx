'use client'
import { useState, useEffect } from 'react'
import { EMAILJS, AGENT_EMAILS } from '@/lib/emailjs'

const AGENTS = [
  { value: 'any',      label: 'No preference — assign me an agent' },
  { value: 'alan',     label: 'Alan Klein' },
  { value: 'anissa',   label: 'Anissa Dean' },
  { value: 'beth',     label: 'Beth Vanergrift' },
  { value: 'connie',   label: 'Connie Brant' },
  { value: 'dawn',     label: 'Dawn Roffey' },
  { value: 'denise',   label: 'Denise Berger' },
  { value: 'jane',     label: 'Jane Goerke' },
  { value: 'joel',     label: 'Joel Trinidad' },
  { value: 'larry',    label: 'Larry Oakley' },
  { value: 'norma',    label: 'Norma Allen' },
  { value: 'patty',    label: 'Patty Wells' },
  { value: 'rob',      label: 'Robert Traversi' },
  { value: 'rochelle', label: 'Rochelle Coronado' },
  { value: 'rosemary', label: 'Rosemary Karnes' },
  { value: 'sue',      label: 'Sue Muldoon' },
]

export default function IntakeForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    import('@emailjs/browser').then(emailjs => {
      emailjs.init({ publicKey: EMAILJS.publicKey })
      setLoaded(true)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!loaded) return
    const emailjs = await import('@emailjs/browser')
    const fd = new FormData(e.currentTarget)
    const agent = fd.get('agent') as string
    setStatus('sending')
    try {
      await emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, {
        to_email:    AGENT_EMAILS[agent] || AGENT_EMAILS.any,
        from_name:   fd.get('name'),
        reply_to:    fd.get('email'),
        phone:       fd.get('phone') || 'Not provided',
        travelers:   fd.get('travelers') || 'Not specified',
        destination: fd.get('destination') || 'Not specified',
        travel_date: fd.get('date') || 'Not specified',
        budget:      fd.get('budget') || 'Not specified',
        message:     fd.get('message') || 'No message',
      })
      setStatus('success')
      ;(e.target as HTMLFormElement).reset()
    } catch {
      setStatus('error')
    }
  }

  const input = 'w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-gold text-sm'
  const label = 'block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5'

  return (
    <section className="bg-navy py-24 px-[5%]" id="contact">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-3">Let's Get Started</p>
        <h2 className="text-3xl md:text-4xl text-white mb-4">Plan Your Dream Trip</h2>
        <p className="text-white/70 text-base">Tell us about your travel dreams and an agent will be in touch within 24 hours.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={label}>Your Name *</label>
          <input name="name" required placeholder="Jane Smith" className={input} />
        </div>
        <div>
          <label className={label}>Email Address *</label>
          <input name="email" type="email" required placeholder="jane@example.com" className={input} />
        </div>
        <div>
          <label className={label}>Phone Number</label>
          <input name="phone" placeholder="(555) 123-4567" className={input} />
        </div>
        <div>
          <label className={label}>Number of Travelers</label>
          <input name="travelers" placeholder="2 adults, 1 child" className={input} />
        </div>
        <div>
          <label className={label}>Destination / Trip Type</label>
          <input name="destination" placeholder="Caribbean cruise, Europe, etc." className={input} />
        </div>
        <div>
          <label className={label}>Approximate Travel Dates</label>
          <input name="date" placeholder="March 2026 or flexible" className={input} />
        </div>
        <div>
          <label className={label}>Budget Range</label>
          <input name="budget" placeholder="$2,000–$5,000 per person" className={input} />
        </div>
        <div>
          <label className={label}>Preferred Agent</label>
          <select name="agent" className={input + ' cursor-pointer'}>
            {AGENTS.map(a => (
              <option key={a.value} value={a.value} className="bg-navy text-white">{a.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={label}>Additional Notes</label>
          <textarea name="message" rows={4} placeholder="Any special requests, celebrations, or details..." className={input + ' resize-none'} />
        </div>

        <div className="md:col-span-2 flex flex-col items-center gap-4">
          <button
            type="submit"
            disabled={status === 'sending'}
            className="bg-gold text-navy font-bold uppercase tracking-wider text-sm px-10 py-3.5 rounded hover:bg-gold-hover transition-colors disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending…' : 'Send My Inquiry'}
          </button>
          {status === 'success' && (
            <p className="text-green-400 text-sm">✓ Sent! Your agent will be in touch shortly.</p>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-sm">Something went wrong — please try again or email us directly.</p>
          )}
        </div>
      </form>
    </section>
  )
}
