import type { Metadata } from 'next'
import ResourcesClient from './ResourcesClient'

export const metadata: Metadata = { title: 'Travel Resources' }

export default function ResourcesPage() {
  return (
    <>
      <div className="bg-navy py-20 px-[5%] text-center">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-3">Plan with Confidence</p>
        <h1 className="text-[clamp(2rem,4vw,3.2rem)] text-white">Travel Resources</h1>
        <p className="text-white/70 mt-4 max-w-xl mx-auto">
          Everything you need to protect and enhance your trip — insurance, connectivity, transfers, and more.
        </p>
      </div>
      <ResourcesClient />
    </>
  )
}
