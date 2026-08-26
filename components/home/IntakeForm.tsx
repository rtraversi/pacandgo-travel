'use client'
import { useState } from 'react'
import { submitInquiry } from '@/app/actions/inquiry'
import { HONEYPOT_FIELD } from '@/lib/inquiry'
import type { IntakeAgent } from '@/lib/types'

// The roster itself comes from the `agents` table via getIntakeAgents(), so
// adding an agent in the admin panel is all it takes to list them here.
const NO_PREFERENCE: IntakeAgent = {
  slug: 'any',
  label: 'No preference — assign me an agent',
}

export default function IntakeForm({ agents }: { agents: IntakeAgent[] }) {
  const options = [NO_PREFERENCE, ...agents]
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setStatus('sending')
    const result = await submitInquiry(new FormData(form))
    if (result.ok) {
      setStatus('success')
      setError(null)
      form.reset()
    } else {
      setStatus('error')
      setError(result.error)
    }
  }

  const input = 'w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-gold text-sm'
  const label = 'block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5'

  return (
    <section className="bg-navy py-24 px-[5%]" id="contact">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-3">Let&apos;s Get Started</p>
        <h2 className="text-3xl md:text-4xl text-white mb-4">Plan Your Dream Trip</h2>
        <p className="text-white/70 text-base">Tell us about your travel dreams and an agent will be in touch within 24 hours.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        <input type="hidden" name="source" value="intake" />
        {/* Honeypot — hidden from people, irresistible to bots. */}
        <input
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
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
          <input name="travel_date" placeholder="March 2026 or flexible" className={input} />
        </div>
        <div>
          <label className={label}>Budget Range</label>
          <input name="budget" placeholder="$2,000–$5,000 per person" className={input} />
        </div>
        <div>
          <label className={label}>Preferred Agent</label>
          <select name="agent" className={input + ' cursor-pointer'}>
            {options.map(a => (
              <option key={a.slug} value={a.slug} className="bg-navy text-white">{a.label}</option>
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
            <p className="text-red-400 text-sm">{error || 'Something went wrong — please try again or email us directly.'}</p>
          )}
        </div>
      </form>
    </section>
  )
}
