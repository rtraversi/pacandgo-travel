'use client'
import { useState } from 'react'
import Link from 'next/link'

const TABS = ['All', 'Insurance', 'eSIM', 'VPN', 'Transfers'] as const
type Tab = typeof TABS[number]

const AFFILIATE_SECTIONS = {
  Insurance: {
    label: 'Travel Insurance',
    description: "Don't let the unexpected derail your dream vacation. PAC and GO Travel strongly recommends insuring every trip.",
    tip: 'Always purchase travel insurance at the time of booking for the broadest coverage, including pre-existing condition waivers.',
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
    description: 'Stay connected abroad without roaming charges — install a local data plan before you land.',
    tip: "eSIMs work on most unlocked smartphones made after 2018. Check your phone's Settings under Cellular or Mobile Data to confirm support before your trip.",
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
    description: 'Protect your personal data on hotel, airport, and ship Wi-Fi networks while traveling.',
    tip: 'Public Wi-Fi on cruise ships and in hotels is a common target for data theft. A VPN encrypts your connection — especially important for online banking and email abroad.',
    items: [
      {
        name: 'ExpressVPN',
        desc: 'The fastest and most reliable travel VPN — one-click connect, works in 94+ countries.',
        href: 'https://www.expressvpn.com',
        pills: ['94+ Countries', 'No-Log Policy', 'Split Tunneling', '5 Devices'],
      },
      {
        name: 'NordVPN',
        desc: 'Top-rated security with a strict no-logs policy and great value for frequent travelers.',
        href: 'https://nordvpn.com',
        pills: ['6 Devices', 'Double VPN', 'Threat Protection', 'Streaming Access'],
      },
    ],
  },
  Transfers: {
    label: 'Airport & Port Transfers',
    description: "Pre-book private or shared transfers so there's a driver waiting when you land or dock.",
    tip: "Book transfers in advance, especially on embarkation day. Arriving at the port late can mean missing your ship's departure — cruise lines don't wait.",
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

const CRUISE_LINES = [
  { label: 'Royal Caribbean',      desc: 'The largest cruise line in the world — great for families and adventure seekers.',  href: 'https://www.royalcaribbean.com' },
  { label: 'Carnival Cruise Line', desc: 'Fun ships with something for everyone — perfect for first-timers.',                 href: 'https://www.carnival.com' },
  { label: 'Norwegian Cruise Line',desc: 'Freestyle cruising with no set dining times — ultimate flexibility.',              href: 'https://www.ncl.com' },
  { label: 'Celebrity Cruises',    desc: 'Premium cruising with a modern, upscale feel.',                                    href: 'https://www.celebritycruises.com' },
  { label: 'Viking Ocean & River', desc: 'Destination-focused itineraries for the curious traveler.',                       href: 'https://www.vikingcruises.com' },
  { label: 'Disney Cruise Line',   desc: 'Magic at sea for families — incomparable entertainment and service.',              href: 'https://disneycruise.disney.go.com' },
]

const TRAVEL_TOOLS = [
  { label: 'US Passport Application', desc: 'Apply for or renew your US passport.',                                        href: 'https://travel.state.gov/content/travel/en/passports.html' },
  { label: 'TSA Pre-Check',           desc: 'Skip the long security lines at airports.',                                   href: 'https://www.tsa.gov/precheck' },
  { label: 'Global Entry',            desc: 'Expedited US customs clearance for international travelers.',                  href: 'https://www.cbp.gov/global-entry' },
  { label: 'CDC Traveler Health',     desc: 'Health recommendations and vaccine requirements by destination.',              href: 'https://wwwnc.cdc.gov/travel' },
  { label: 'US State Dept Travel',    desc: 'Current travel advisories and country entry requirements.',                    href: 'https://travel.state.gov' },
]

const AFFILIATIONS = [
  { label: 'CLIA',  desc: 'Cruise Lines International Association — our agents are CLIA-certified.', href: 'https://cruising.org' },
  { label: 'ASTA',  desc: 'American Society of Travel Advisors — the voice of travel professionals.', href: 'https://www.asta.org' },
  { label: 'IATAN', desc: 'International Airlines Travel Agent Network — confirming our accreditation.', href: 'https://www.iatan.org' },
]

function SimpleCard({ item }: { item: { label: string; desc: string; href: string } }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-light rounded-xl p-5 hover:shadow-md hover:border-gold/40 transition-all no-underline group"
    >
      <h3 className="text-navy font-bold text-base mb-2 group-hover:text-ocean transition-colors">{item.label}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
      <span className="text-gold text-xs font-bold mt-3 inline-block group-hover:underline">Visit →</span>
    </a>
  )
}

function AffiliateSection({ section }: { section: typeof AFFILIATE_SECTIONS[keyof typeof AFFILIATE_SECTIONS] }) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl text-navy mb-2 pb-3 border-b border-light">{section.label}</h2>
      <p className="text-gray-500 text-sm mb-5">{section.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
        {section.items.map(item => (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-light rounded-xl p-5 hover:shadow-md hover:border-gold/40 transition-all no-underline group"
          >
            <h3 className="text-navy font-bold text-base mb-2 group-hover:text-ocean transition-colors">{item.name}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-3">{item.desc}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item.pills.map(pill => (
                <span key={pill} className="bg-light text-navy text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded">{pill}</span>
              ))}
            </div>
            <span className="text-gold text-xs font-bold group-hover:underline">Visit →</span>
          </a>
        ))}
      </div>
      <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
        <p className="text-navy text-sm"><span className="font-bold">💡 Agent Tip:</span> {section.tip}</p>
      </div>
    </div>
  )
}

export default function ResourcesClient() {
  const [tab, setTab] = useState<Tab>('All')

  return (
    <div className="py-16 px-[5%] max-w-5xl mx-auto">
      {/* Tab nav */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-light pb-5">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              tab === t
                ? 'bg-gold text-navy'
                : 'bg-light text-navy/60 hover:bg-gold/20 hover:text-navy'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Single affiliate tab */}
      {tab !== 'All' && (
        <AffiliateSection section={AFFILIATE_SECTIONS[tab]} />
      )}

      {/* All tab */}
      {tab === 'All' && (
        <>
          {(Object.values(AFFILIATE_SECTIONS)).map(section => (
            <AffiliateSection key={section.label} section={section} />
          ))}

          <h2 className="text-2xl text-navy mb-6 pb-3 border-b border-light mt-4">Cruise Lines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {CRUISE_LINES.map(item => <SimpleCard key={item.label} item={item} />)}
          </div>

          <h2 className="text-2xl text-navy mb-6 pb-3 border-b border-light">Travel Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {TRAVEL_TOOLS.map(item => <SimpleCard key={item.label} item={item} />)}
          </div>

          <h2 className="text-2xl text-navy mb-6 pb-3 border-b border-light">Industry Affiliations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AFFILIATIONS.map(item => <SimpleCard key={item.label} item={item} />)}
          </div>
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
