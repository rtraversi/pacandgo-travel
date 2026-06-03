'use client'
import { useState, useEffect } from 'react'
import { EMAILJS } from '@/lib/emailjs'

interface Props {
  agentEmail: string
  agentName: string
}

export default function AgentContactForm({ agentEmail, agentName }: Props) {
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
    setStatus('sending')
    try {
      await emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, {
        to_email:    agentEmail,
        from_name:   fd.get('name'),
        reply_to:    fd.get('email'),
        phone:       fd.get('phone') || 'Not provided',
        message:     fd.get('message'),
        travelers:   '',
        destination: '',
        travel_date: '',
        budget:      '',
      })
      setStatus('success')
      ;(e.target as HTMLFormElement).reset()
    } catch {
      setStatus('error')
    }
  }

  const input = 'w-full bg-white border border-gray-200 rounded px-4 py-3 text-navy placeholder:text-gray-400 focus:outline-none focus:border-gold text-sm'
  const label = 'block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5'

  return (
    <section className="py-20 px-[5%] bg-sand" id="contact">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-3">Get In Touch</p>
        <h2 className="text-3xl md:text-4xl text-navy mb-3">Book with {agentName.split(' ')[0]}</h2>
        <p className="text-gray-500 mb-8">Ready to start planning? Send a message and I&apos;ll get back to you within 24 hours.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={label}>Your Name *</label>
            <input name="name" required placeholder="Jane Smith" className={input} />
          </div>
          <div>
            <label className={label}>Email Address *</label>
            <input name="email" type="email" required placeholder="jane@example.com" className={input} />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Phone Number</label>
            <input name="phone" placeholder="(555) 123-4567" className={input} />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Message *</label>
            <textarea name="message" required rows={5} placeholder="Tell me about your dream trip..." className={input + ' resize-none'} />
          </div>

          <div className="md:col-span-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full md:w-auto bg-gold text-navy font-bold uppercase tracking-wider text-sm px-10 py-3.5 rounded hover:bg-gold-hover transition-colors disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
            {status === 'success' && <p className="text-green-600 text-sm">✓ Message sent! I&apos;ll be in touch soon.</p>}
            {status === 'error' && <p className="text-red-500 text-sm">Something went wrong — please try again.</p>}
          </div>
        </form>
      </div>
    </section>
  )
}
