'use client'
import { useState, type CSSProperties } from 'react'
import Link from 'next/link'

const TABS = ['All', 'Cruise Research', 'Insurance', 'eSIM', 'VPN', 'Transfers'] as const
type Tab = typeof TABS[number]

type ResourceItem = { name: string; desc: string; href: string; pills?: string[] }

type Section = {
  label: string
  /* Each section carries its own accent. The colour codes the category and
     marks where one section ends and the next begins. */
  accent: string
  description: string
  tip?: string
  columns: 2 | 3
  items: ResourceItem[]
}

const AFFILIATE_SECTIONS: Record<Exclude<Tab, 'All'>, Section> = {
  'Cruise Research': {
    label: 'Cruise Research',
    accent: '#1a5276',
    description: 'Compare sailings, cabin categories, and fare history before you book — then bring what you find to your agent.',
    tip: 'Fares move constantly. Track a sailing you like for a week or two before booking, and let us know the moment it drops — we can often reprice an existing booking.',
    columns: 2,
    items: [
      {
        name: 'CruisePlum',
        desc: 'Search every major cruise line at once, filter by price per night, and watch fares change over time.',
        href: 'https://www.cruiseplum.com/',
        pills: ['All Major Lines', 'Price Tracking', 'Cabin Comparison', 'Deal Alerts'],
      },
    ],
  },
  Insurance: {
    label: 'Travel Insurance',
    accent: '#a94438',
    description: "Don't let the unexpected derail your dream vacation. PAC and GO Travel strongly recommends insuring every trip.",
    tip: 'Always purchase travel insurance at the time of booking for the broadest coverage, including pre-existing condition waivers.',
    columns: 2,
    items: [
      {
        name: 'Allianz Travel Insurance',
        desc: 'Comprehensive trip protection — cancellations, medical emergencies, lost luggage, and more.',
        href: 'https://www.allianztravelinsurance.com',
        pills: ['Trip Cancellation', 'Medical Coverage', 'Lost Luggage', 'Emergency Evacuation'],
      },
      {
        name: 'Travel Insured International',
        desc: 'Flexible plans for every type of traveler, from weekend getaways to international adventures.',
        href: 'https://www.travelinsured.com',
        pills: ['Cancel For Any Reason', 'Annual Plans', 'Group Coverage', 'Cruise Protection'],
      },
    ],
  },
  eSIM: {
    label: 'Travel eSIM',
    accent: '#0e7c7b',
    description: 'Stay connected abroad without roaming charges — install a local data plan before you land.',
    tip: "eSIMs work on most unlocked smartphones made after 2018. Check your phone's Settings under Cellular or Mobile Data to confirm support before your trip.",
    columns: 2,
    items: [
      {
        name: 'Airalo',
        desc: "The world's first eSIM marketplace — data plans for 200+ countries starting from $5. Install before you fly.",
        href: 'https://www.airalo.com',
        pills: ['200+ Countries', 'Instant Activation', 'No Physical SIM', 'Data-Only Plans'],
      },
      {
        name: 'Nomad eSIM',
        desc: 'Regional and global data plans with no hidden fees. Great for multi-country itineraries.',
        href: 'https://www.getnomad.app',
        pills: ['Regional Plans', 'Global Coverage', 'No Contracts', 'Easy Setup'],
      },
    ],
  },
  VPN: {
    label: 'Travel VPN',
    accent: '#4a4173',
    description: 'Protect your personal data on hotel, airport, and ship Wi-Fi networks while traveling.',
    tip: 'Public Wi-Fi on cruise ships and in hotels is a common target for data theft. A VPN encrypts your connection — especially important for online banking and email abroad.',
    columns: 2,
    items: [
      {
        name: 'ExpressVPN',
        desc: 'The fastest and most reliable travel VPN — one-click connect, works in 94+ countries.',
        href: 'https://www.expressvpn.com',
        pills: ['94+ Countries', 'No-Log Policy', 'Split Tunneling', '5 Devices'],
      },
    ],
  },
  Transfers: {
    label: 'Airport & Port Transfers',
    accent: '#2f6b4f',
    description: "Pre-book private or shared transfers so there's a driver waiting when you land or dock.",
    tip: "Book transfers in advance, especially on embarkation day. Arriving at the port late can mean missing your ship's departure — cruise lines don't wait.",
    columns: 2,
    items: [
      {
        name: 'Jayride',
        desc: 'Compare and book airport transfers in 100+ countries — private cars, shared shuttles, and luxury options.',
        href: 'https://www.jayride.com',
        pills: ['100+ Countries', 'Price Comparison', 'Private & Shared', 'Flight Tracking'],
      },
      {
        name: 'Welcome Pickups',
        desc: 'Professional, English-speaking drivers in popular European and Mediterranean destinations.',
        href: 'https://www.welcomepickups.com',
        pills: ['Fixed Pricing', 'English Drivers', 'Flight Monitoring', 'Free Cancellation'],
      },
    ],
  },
}

const REFERENCE_SECTIONS: Section[] = [
  {
    label: 'Cruise Lines',
    accent: '#0d2b45',
    description: 'Browse the fleets we book most — then let us handle the pricing, perks, and paperwork.',
    columns: 3,
    items: [
      { name: 'Royal Caribbean',       desc: 'The largest cruise line in the world — great for families and adventure seekers.', href: 'https://www.royalcaribbean.com' },
      { name: 'Carnival Cruise Line',  desc: 'Fun ships with something for everyone — perfect for first-timers.',                href: 'https://www.carnival.com' },
      { name: 'Norwegian Cruise Line', desc: 'Freestyle cruising with no set dining times — ultimate flexibility.',              href: 'https://www.ncl.com' },
      { name: 'Celebrity Cruises',     desc: 'Premium cruising with a modern, upscale feel.',                                    href: 'https://www.celebritycruises.com' },
      { name: 'Viking Ocean & River',  desc: 'Destination-focused itineraries for the curious traveler.',                        href: 'https://www.vikingcruises.com' },
      { name: 'Disney Cruise Line',    desc: 'Magic at sea for families — incomparable entertainment and service.',              href: 'https://disneycruise.disney.go.com' },
    ],
  },
  {
    label: 'Travel Tools',
    accent: '#4d5c6b',
    description: 'Passports, entry requirements, and trusted-traveler programs, straight from the source.',
    columns: 3,
    items: [
      { name: 'US Passport Application', desc: 'Apply for or renew your US passport.',                            href: 'https://travel.state.gov/content/travel/en/passports.html' },
      { name: 'TSA Pre-Check',           desc: 'Skip the long security lines at airports.',                       href: 'https://www.tsa.gov/precheck' },
      { name: 'Global Entry',            desc: 'Expedited US customs clearance for international travelers.',      href: 'https://www.cbp.gov/global-entry' },
      { name: 'CDC Traveler Health',     desc: 'Health recommendations and vaccine requirements by destination.',  href: 'https://wwwnc.cdc.gov/travel' },
      { name: 'US State Dept Travel',    desc: 'Current travel advisories and country entry requirements.',        href: 'https://travel.state.gov' },
    ],
  },
  {
    label: 'Industry Affiliations',
    accent: '#8a6a2f',
    description: 'The accreditations behind every booking we make.',
    columns: 3,
    items: [
      { name: 'CLIA',  desc: 'Cruise Lines International Association — our agents are CLIA-certified.',     href: 'https://cruising.org' },
      { name: 'ASTA',  desc: 'American Society of Travel Advisors — the voice of travel professionals.',    href: 'https://www.asta.org' },
      { name: 'IATAN', desc: 'International Airlines Travel Agent Network — confirming our accreditation.', href: 'https://www.iatan.org' },
    ],
  },
]

function ResourceCard({ item, accent }: { item: ResourceItem; accent: string }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ '--accent': accent } as CSSProperties}
      className="group flex flex-col overflow-hidden rounded-xl border border-light no-underline transition-all hover:shadow-md hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="px-5 py-3" style={{ backgroundColor: accent }}>
        <h3 className="text-white font-bold text-base leading-snug">{item.name}</h3>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-gray-500 text-sm leading-relaxed mb-3">{item.desc}</p>
        {item.pills && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.pills.map(pill => (
              <span
                key={pill}
                className="text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
                style={{ backgroundColor: `${accent}14`, color: accent }}
              >
                {pill}
              </span>
            ))}
          </div>
        )}
        <span className="mt-auto text-gold text-xs font-bold group-hover:underline">Visit →</span>
      </div>
    </a>
  )
}

function SectionBlock({ section }: { section: Section }) {
  const { accent } = section
  return (
    <section className="mb-12">
      <h2 className="text-2xl text-navy mb-3">{section.label}</h2>
      {/* Accent lead-in on the rule — the colour hands off from section to section */}
      <div className="relative h-0.5 w-full bg-light mb-4">
        <span className="absolute left-0 top-0 h-full w-16 rounded-full" style={{ backgroundColor: accent }} />
      </div>
      <p className="text-gray-500 text-sm mb-5">{section.description}</p>
      <div
        className={`grid grid-cols-1 gap-5 mb-4 ${
          section.columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'
        }`}
      >
        {section.items.map(item => (
          <ResourceCard key={item.name} item={item} accent={accent} />
        ))}
      </div>
      {section.tip && (
        <div className="rounded-lg border p-4" style={{ backgroundColor: `${accent}0f`, borderColor: `${accent}33` }}>
          <p className="text-navy text-sm">
            <span className="font-bold" style={{ color: accent }}>💡 Agent Tip:</span> {section.tip}
          </p>
        </div>
      )}
    </section>
  )
}

export default function ResourcesClient() {
  const [tab, setTab] = useState<Tab>('All')

  return (
    <div className="py-16 px-[5%] max-w-5xl mx-auto">
      {/* Tab nav — each chip carries the colour of the section it opens */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-light pb-5">
        {TABS.map(t => {
          const active = tab === t
          const accent = t === 'All' ? '#c9a84c' : AFFILIATE_SECTIONS[t].accent
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-pressed={active}
              className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                active ? '' : 'bg-light text-navy/60 hover:bg-navy/10 hover:text-navy'
              }`}
              style={active ? { backgroundColor: accent, color: t === 'All' ? '#0d2b45' : '#ffffff' } : undefined}
            >
              {!active && t !== 'All' && (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full mr-2 align-middle"
                  style={{ backgroundColor: accent }}
                />
              )}
              {t}
            </button>
          )
        })}
      </div>

      {tab !== 'All' && <SectionBlock section={AFFILIATE_SECTIONS[tab]} />}

      {tab === 'All' && (
        <>
          {Object.values(AFFILIATE_SECTIONS).map(section => (
            <SectionBlock key={section.label} section={section} />
          ))}
          {REFERENCE_SECTIONS.map(section => (
            <SectionBlock key={section.label} section={section} />
          ))}
        </>
      )}

      <div className="bg-navy rounded-2xl p-10 text-center mt-12">
        <h2 className="text-white text-2xl mb-3">Have a Question?</h2>
        <p className="text-white/70 mb-6">Our agents are happy to help you navigate any resource or plan your next trip.</p>
        <Link href="/contact" className="inline-block bg-gold text-navy font-bold uppercase tracking-wider text-sm px-8 py-3 rounded hover:bg-gold-hover transition-colors no-underline">
          Contact an Agent
        </Link>
      </div>
    </div>
  )
}
