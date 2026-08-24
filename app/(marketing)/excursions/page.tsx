import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Excursions & Tours' }

/**
 * Affiliate links, shared with the Cruising With Me site.
 *
 * The Project Expedition tracking string is one value used by every PE link on
 * the page — destination pages just add a path in front of it — so a change to
 * the referral code happens in exactly one place.
 */
const PE_TRACKING = 'utm_source=cruisingwithmetravel-58791-pacandgorob-111793&utm_medium=referral&utm_campaign=tagent'
const pe = (path = '') => `https://www.projectexpedition.com/${path}?${PE_TRACKING}`

const VIATOR = 'https://www.viator.com/?pid=P00002449&uid=U00002894&mcid=58086&currency=USD'
const EXPEDIA = 'https://expedia.com/affiliates/expedia-home.Eo7hEHf'

const WHY_BOOK = [
  {
    icon: '💰',
    title: 'Often Cheaper Than the Ship',
    text: 'Third-party excursions are frequently 20–40% less than the same tour booked through your cruise line — same experience, better price.',
  },
  {
    icon: '🎯',
    title: 'Thousands of Options',
    text: 'From snorkeling in the Bahamas to wine tasting in Barcelona — far more choice than the handful of tours sold onboard.',
  },
  {
    icon: '⭐',
    title: 'Verified Reviews',
    text: 'Read what other travelers actually experienced before you book, so there are no surprises on your port day.',
  },
  {
    icon: '🚢',
    title: 'Ship-Safe Guarantees',
    text: 'Select tours guarantee you back to the ship on time — look for the badge, and ask us if you are unsure.',
  },
]

const DESTINATIONS = [
  {
    name: 'Caribbean',
    emoji: '🌊',
    gradient: 'from-[#0077b6] to-[#023e8a]',
    desc: 'The most popular cruise destination in the world — and for good reason. Snorkel crystal-clear water, zip-line through rainforest, or just find the perfect beach.',
    tags: ['Bahamas', 'Cozumel', 'Jamaica', 'Aruba', 'St. Maarten', 'Cayman Islands'],
    href: pe('destination/caribbean/'),
    cta: 'Browse Caribbean Excursions',
  },
  {
    name: 'Mediterranean & Europe',
    emoji: '🏛️',
    gradient: 'from-[#c0392b] to-[#8e44ad]',
    desc: 'Ancient ruins, world-class art, stunning coastlines, and unforgettable food. European ports offer some of the richest cultural experiences at sea.',
    tags: ['Spain', 'Italy', 'Greece', 'Portugal', 'Croatia', 'France'],
    href: pe('destination/western-europe/'),
    cta: 'Browse Europe Excursions',
  },
  {
    name: 'Alaska',
    emoji: '🐋',
    gradient: 'from-[#1a3a4a] to-[#2e8b57]',
    desc: 'Glaciers, wildlife, and raw wilderness unlike anywhere else. Alaska ports deliver everything from whale watching to helicopter glacier walks.',
    tags: ['Juneau', 'Ketchikan', 'Skagway', 'Glacier Bay', 'Sitka'],
    href: pe('location/united-states/'),
    cta: 'Browse Alaska Excursions',
  },
  {
    name: 'Central America',
    emoji: '🌴',
    gradient: 'from-[#1a5c38] to-[#06d6a0]',
    desc: "Zip-line through cloud forest in Costa Rica, explore Mayan ruins in Belize, or snorkel the reef in Honduras. An adventurer's paradise.",
    tags: ['Belize', 'Costa Rica', 'Honduras', 'Panama', 'Guatemala'],
    href: pe('destination/central-america/'),
    cta: 'Browse Central America Excursions',
  },
  {
    name: 'Bahamas & Bermuda',
    emoji: '🏝️',
    gradient: 'from-[#2c3e50] to-[#3498db]',
    desc: 'Pink sand beaches, swimming pigs, cliff diving, and crystal grottos — some of the most iconic shore experiences in the Atlantic.',
    tags: ['Nassau', 'Freeport', 'Bermuda', 'Exumas', 'Eleuthera'],
    href: pe('location/bahamas/'),
    cta: 'Browse Bahamas Excursions',
  },
  {
    name: 'Worldwide',
    emoji: '🌏',
    gradient: 'from-[#7d3c98] to-[#e74c3c]',
    desc: 'Australia, New Zealand, South America, Asia, the Middle East — if your ship stops there, there are almost certainly experiences waiting.',
    tags: ['Australia', 'Japan', 'Peru', 'South Africa', 'New Zealand'],
    href: pe(),
    cta: 'Browse All Destinations',
  },
]

const EXPERIENCE_TYPES = [
  { icon: '🤿', title: 'Water Sports & Snorkeling', desc: 'Snorkeling, scuba, kayaking, jet skiing & more' },
  { icon: '🏛️', title: 'History & Culture', desc: 'City tours, ruins, museums & local life' },
  { icon: '🧗', title: 'Adventure & Thrills', desc: 'Zip-lining, ATV tours, cliff jumping & hiking' },
  { icon: '🍷', title: 'Food & Wine', desc: 'Wine tours, cooking classes, food markets & tastings' },
  { icon: '🐬', title: 'Wildlife & Nature', desc: 'Whale watching, jungle treks, wildlife sanctuaries' },
  { icon: '🏖️', title: 'Beach & Relaxation', desc: 'Private beaches, beach clubs, catamaran sails' },
  { icon: '👨‍👩‍👧‍👦', title: 'Family Friendly', desc: 'Kid-approved adventures the whole family will love' },
  { icon: '📸', title: 'Photography Tours', desc: 'Capture stunning landscapes, architecture & wildlife' },
]

const PARTNERS = [
  {
    name: 'Project Expedition',
    badge: 'Cruise Specialist',
    icon: '🗺️',
    gradient: 'from-[#0a2342] to-[#1a4a8a]',
    button: 'bg-[#1a4a8a] hover:bg-[#215ead]',
    tagline: 'Purpose-built for cruise travelers — shore excursions and port day tours at every major cruise destination worldwide.',
    highlights: [
      'Designed specifically for cruise port excursions',
      'Ship-safe guarantees on select tours',
      'Often significantly less than cruise line pricing',
      'Caribbean, Europe, Alaska, Central America & more',
      'Verified traveler reviews from fellow cruisers',
    ],
    href: pe(),
  },
  {
    name: 'Viator',
    badge: "World's Largest",
    icon: '🌍',
    gradient: 'from-[#cc0000] to-[#e63946]',
    button: 'bg-[#cc0000] hover:bg-[#e63946]',
    tagline: "The world's leading tours and experiences platform — over 300,000 activities in 190+ countries with millions of verified reviews.",
    highlights: [
      '300,000+ tours, activities & experiences worldwide',
      'Millions of verified TripAdvisor traveler reviews',
      'Excellent for pre & post-cruise city experiences',
      'Flexible cancellation on most bookings',
      'Instant confirmation available on many tours',
    ],
    href: VIATOR,
  },
  {
    name: 'Expedia',
    badge: 'Flights, Hotels & More',
    icon: '✈️',
    gradient: 'from-[#003580] to-[#0071c2]',
    button: 'bg-[#003580] hover:bg-[#0071c2]',
    tagline: 'Book your complete trip in one place — flights, hotels, car rentals, activities, and vacation packages at competitive rates.',
    highlights: [
      'Bundle flights + hotel for extra savings',
      '350,000+ properties worldwide',
      'Car rentals, activities & airport transfers',
      'Flexible cancellation on many bookings',
      'Great for pre & post-cruise travel planning',
    ],
    href: EXPEDIA,
  },
]

const STEPS = [
  { n: 1, title: 'Browse by Port', text: 'Search your specific port of call — Cozumel, Nassau, Juneau, Barcelona — and see everything available there.' },
  { n: 2, title: 'Compare & Choose', text: "Read reviews, check prices, and compare what's included. Filter by activity type, price, duration, and difficulty." },
  { n: 3, title: 'Book Securely', text: 'Book directly on the platform. Most tours offer instant confirmation and flexible cancellation.' },
  { n: 4, title: 'Enjoy the Adventure', text: 'Show up at the meeting point with your confirmation and get ready for an unforgettable port day.' },
]

const heroBtn = 'inline-block font-bold uppercase tracking-wider text-sm px-7 py-3.5 rounded-full transition-colors no-underline text-white'

export default function ExcursionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-20 px-[5%] text-center">
        <span className="inline-block bg-gold/15 border border-gold/30 text-gold text-[0.7rem] font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full mb-5">
          🌍 Powered by Project Expedition, Viator &amp; Expedia
        </span>
        <h1 className="text-[clamp(2rem,4vw,3.2rem)] text-white leading-[1.15]">
          Make Every Port<br /><em className="text-gold">An Adventure</em>
        </h1>
        <p className="text-white/70 mt-5 max-w-2xl mx-auto leading-relaxed">
          Your cruise gets you there — but what you do at each port is where the real magic happens. Browse thousands of
          shore excursions, tours, and experiences at every destination worldwide.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <a href={pe()} target="_blank" rel="noopener noreferrer" className={`${heroBtn} bg-[#1a4a8a] hover:bg-[#215ead]`}>
            🗺️ Browse Project Expedition
          </a>
          <a href={VIATOR} target="_blank" rel="noopener noreferrer" className={`${heroBtn} bg-[#cc0000] hover:bg-[#e63946]`}>
            🌍 Browse Viator
          </a>
          <a href={EXPEDIA} target="_blank" rel="noopener noreferrer" className={`${heroBtn} bg-[#0071c2] hover:bg-[#0a86dd]`}>
            ✈️ Browse Expedia
          </a>
        </div>
      </section>

      {/* Disclosure */}
      <div className="bg-light border-b border-navy/10 px-[5%] py-4 text-center">
        <p className="text-navy/70 text-[0.82rem] leading-relaxed max-w-4xl mx-auto">
          <span className="font-bold text-navy">ℹ️ Please note:</span>{' '}
          Excursions on this page are offered through independent third-party booking platforms that are not affiliated
          with PAC and GO Travel. You book and pay directly through each platform using your own account. As always, our
          agents are here to help you choose —{' '}
          <Link href="/contact" className="text-ocean font-semibold hover:underline">reach out anytime</Link>.
        </p>
      </div>

      <div className="py-20 px-[5%] max-w-6xl mx-auto">

        {/* Why book ahead */}
        <div className="text-center mb-12">
          <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">Why Book Ahead</p>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] text-navy">Don&apos;t Leave Your Port Day to Chance</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            The best excursions sell out fast — especially in popular ports. Booking ahead means the best guides, the best
            seats, and the best memories.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {WHY_BOOK.map(w => (
            <div key={w.title} className="border border-light rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">{w.icon}</div>
              <h3 className="text-navy font-bold text-base mb-2 leading-snug">{w.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{w.text}</p>
            </div>
          ))}
        </div>

        {/* Agent pro tip */}
        <div className="bg-gold/10 border border-gold/25 rounded-xl p-6 mb-16">
          <p className="text-navy text-sm leading-relaxed">
            <span className="font-bold">💡 Pro tip from our agents:</span>{' '}
            Cruise line excursions are convenient, but third-party operators often run the same tour for less — with more
            unique options. The key rule: if your excursion is booked through the cruise line, the ship waits for you. If
            it isn&apos;t, book operators with strong reviews and early-return guarantees. Not sure?{' '}
            <Link href="/contact" className="text-ocean font-semibold hover:underline">Ask your agent</Link> — we&apos;ve
            been to these ports and know who to trust.
          </p>
        </div>

        {/* Destinations */}
        <div className="text-center mb-10">
          <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">Popular Ports</p>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] text-navy">Explore by Destination</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Pick a destination to browse everything available through our partner Project Expedition.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {DESTINATIONS.map(d => (
            <div key={d.name} className="border border-light rounded-xl overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
              <div className={`bg-gradient-to-br ${d.gradient} h-[150px] flex flex-col items-center justify-center gap-1 px-4`}>
                <span className="text-4xl" aria-hidden>{d.emoji}</span>
                <span className="text-white font-bold text-lg text-center leading-tight">{d.name}</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{d.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {d.tags.map(t => (
                    <span key={t} className="bg-light text-navy text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
                <a
                  href={d.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto text-ocean font-bold text-sm hover:text-gold transition-colors no-underline"
                >
                  {d.cta} →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Experience types */}
        <div className="text-center mb-10">
          <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">Find Your Adventure</p>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] text-navy">Browse by Experience Type</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Whether you&apos;re an adrenaline junkie, a history buff, or you just want a beautiful beach — there&apos;s a
            shore excursion for every travel style.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {EXPERIENCE_TYPES.map(t => (
            <a
              key={t.title}
              href={pe()}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-light rounded-xl p-5 text-center hover:border-gold hover:shadow-lg hover:-translate-y-0.5 transition-all no-underline group"
            >
              <span className="text-3xl block mb-2" aria-hidden>{t.icon}</span>
              <h3 className="text-navy font-bold text-sm mb-1.5 leading-snug group-hover:text-ocean transition-colors">{t.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{t.desc}</p>
            </a>
          ))}
        </div>

        {/* Partners */}
        <div className="text-center mb-10">
          <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">Our Travel Partners</p>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] text-navy">Everything You Need for the Perfect Trip</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Hand-picked booking platforms trusted by experienced cruisers — compare your options and find the right tour
            for your port day.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {PARTNERS.map(p => (
            <div key={p.name} className="border border-light rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-shadow">
              <div className={`bg-gradient-to-br ${p.gradient} px-6 py-7`}>
                <span className="inline-block bg-white/15 text-white text-[0.6rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded mb-3">
                  {p.badge}
                </span>
                <h3 className="text-white text-2xl font-bold leading-tight">
                  <span className="mr-2" aria-hidden>{p.icon}</span>{p.name}
                </h3>
                <p className="text-white/75 text-sm mt-2 leading-relaxed">{p.tagline}</p>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <ul className="space-y-2 mb-6">
                  {p.highlights.map(h => (
                    <li key={h} className="text-gray-600 text-sm leading-relaxed flex gap-2">
                      <span className="text-gold font-bold shrink-0" aria-hidden>✓</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${p.button} mt-auto block text-center text-white font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-lg transition-colors no-underline`}
                >
                  Browse {p.name}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-light/70 border border-light rounded-xl p-6 mb-16">
          <p className="text-navy/70 text-[0.82rem] leading-relaxed">
            <span className="font-bold text-navy">ℹ️ Please note:</span>{' '}
            Project Expedition, Viator, and Expedia are independent third-party platforms not affiliated with PAC and GO
            Travel. The links above take you to their own websites, where you create an account and purchase directly
            through their secure checkout. These are affiliate links — at no additional cost to you, we may receive a
            small commission on qualifying purchases, which helps support this site. As always,{' '}
            <Link href="/contact" className="text-ocean font-semibold hover:underline">reach out anytime</Link> and one of
            our agents will help you find the right excursion for your itinerary.
          </p>
        </div>

        {/* How it works */}
        <div className="text-center mb-10">
          <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">Simple Process</p>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] text-navy">How to Book Your Excursion</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {STEPS.map(s => (
            <div key={s.n} className="text-center px-2">
              <div className="w-12 h-12 rounded-full bg-navy text-gold font-bold text-lg flex items-center justify-center mx-auto mb-4">
                {s.n}
              </div>
              <h3 className="text-navy font-bold text-base mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-navy rounded-2xl p-10 text-center">
          <h2 className="text-white text-2xl mb-3">Let Us Handle the Details</h2>
          <p className="text-white/70 mb-6 max-w-lg mx-auto">
            Tell us where you&apos;re going and what you love — our agents will recommend the best excursions for your itinerary.
          </p>
          <Link href="/contact" className="inline-block bg-gold text-navy font-bold uppercase tracking-wider text-sm px-8 py-3 rounded hover:bg-gold-hover transition-colors no-underline">
            Ask an Agent
          </Link>
        </div>
      </div>
    </>
  )
}
