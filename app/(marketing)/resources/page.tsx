import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Travel Resources' }

const RESOURCES = [
  {
    category: 'Cruise Lines',
    items: [
      { label: 'Royal Caribbean',    desc: 'The largest cruise line in the world — great for families and adventure seekers.',  href: 'https://www.royalcaribbean.com' },
      { label: 'Carnival Cruise Line', desc: 'Fun ships with something for everyone — perfect for first-timers.',              href: 'https://www.carnival.com' },
      { label: 'Norwegian Cruise Line', desc: 'Freestyle cruising with no set dining times — ultimate flexibility.',           href: 'https://www.ncl.com' },
      { label: 'Celebrity Cruises',  desc: 'Premium cruising with a modern, upscale feel.',                                    href: 'https://www.celebritycruises.com' },
      { label: 'Viking Ocean & River', desc: 'Destination-focused itineraries for the curious traveler.',                     href: 'https://www.vikingcruises.com' },
      { label: 'Disney Cruise Line', desc: 'Magic at sea for families — incomparable entertainment and service.',              href: 'https://disneycruise.disney.go.com' },
    ],
  },
  {
    category: 'Travel Tools',
    items: [
      { label: 'US Passport Application', desc: 'Apply for or renew your US passport.',                                       href: 'https://travel.state.gov/content/travel/en/passports.html' },
      { label: 'TSA Pre-Check',           desc: 'Skip the long security lines at airports.',                                  href: 'https://www.tsa.gov/precheck' },
      { label: 'Global Entry',            desc: 'Expedited US customs clearance for international travelers.',                href: 'https://www.cbp.gov/global-entry' },
      { label: 'Travel Insurance (Allianz)', desc: 'Comprehensive trip protection for peace of mind.',                        href: 'https://www.allianztravelinsurance.com' },
      { label: 'CDC Traveler Health',     desc: 'Health recommendations and vaccine requirements by destination.',            href: 'https://wwwnc.cdc.gov/travel' },
      { label: 'US State Dept Travel',    desc: 'Current travel advisories and country entry requirements.',                  href: 'https://travel.state.gov' },
    ],
  },
  {
    category: 'Industry Affiliations',
    items: [
      { label: 'CLIA',  desc: 'Cruise Lines International Association — our agents are CLIA-certified.', href: 'https://cruising.org' },
      { label: 'ASTA',  desc: 'American Society of Travel Advisors — the voice of travel professionals.', href: 'https://www.asta.org' },
      { label: 'IATAN', desc: 'International Airlines Travel Agent Network — confirming our accreditation.', href: 'https://www.iatan.org' },
    ],
  },
]

export default function ResourcesPage() {
  return (
    <>
      <div className="bg-navy py-20 px-[5%] text-center">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-3">Plan with Confidence</p>
        <h1 className="text-[clamp(2rem,4vw,3.2rem)] text-white">Travel Resources</h1>
        <p className="text-white/70 mt-4 max-w-lg mx-auto">
          Everything you need to prepare for your journey — from cruise lines to passport applications.
        </p>
      </div>

      <div className="py-20 px-[5%] max-w-5xl mx-auto">
        {RESOURCES.map(section => (
          <div key={section.category} className="mb-14">
            <h2 className="text-2xl text-navy mb-6 pb-3 border-b border-light">{section.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-light rounded-xl p-5 hover:shadow-md hover:border-gold/40 transition-all no-underline group"
                >
                  <h3 className="text-navy font-bold text-base mb-2 group-hover:text-ocean transition-colors">{item.label}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  <span className="text-gold text-xs font-bold mt-3 inline-block group-hover:underline">Visit →</span>
                </a>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-navy rounded-2xl p-10 text-center mt-8">
          <h2 className="text-white text-2xl mb-3">Have a Question?</h2>
          <p className="text-white/70 mb-6">Our agents are happy to help you navigate any resource or plan your next trip.</p>
          <Link href="/contact" className="inline-block bg-gold text-navy font-bold uppercase tracking-wider text-sm px-8 py-3 rounded hover:bg-gold-hover transition-colors no-underline">
            Contact an Agent
          </Link>
        </div>
      </div>
    </>
  )
}
