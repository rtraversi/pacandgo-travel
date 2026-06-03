import type { Metadata } from 'next'
import IntakeForm from '@/components/home/IntakeForm'

export const metadata: Metadata = { title: 'Contact Us' }

export default function ContactPage() {
  return (
    <>
      <div className="bg-navy py-20 px-[5%] text-center">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-3">We&apos;d Love to Hear From You</p>
        <h1 className="text-[clamp(2rem,4vw,3.2rem)] text-white">Contact PAC and GO Travel</h1>
        <p className="text-white/70 mt-4 max-w-lg mx-auto">
          Ready to start planning? Fill out the form below and one of our certified travel specialists will be in touch within 24 hours.
        </p>
      </div>
      <IntakeForm />
    </>
  )
}
