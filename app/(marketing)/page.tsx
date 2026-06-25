import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { agentProfileUrl, initials } from '@/lib/utils'
import IntakeForm from '@/components/home/IntakeForm'
import type { Agent, AgentProfile } from '@/lib/types'

type AgentWithProfile = Agent & { agent_profiles: AgentProfile | null }

const SPECIALTIES = [
  {
    title: 'Ocean Cruises',
    desc: 'Caribbean, Mediterranean, Alaska & beyond — we know every major cruise line inside and out.',
    img: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=700&q=80',
    alt: 'Cruise ship',
  },
  {
    title: 'All-Inclusive Resorts',
    desc: 'Sun, sand, and everything included — we find the perfect resort for your budget and style.',
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=700&q=80',
    alt: 'All-inclusive resort',
  },
  {
    title: 'European Escapes',
    desc: 'River cruises, guided tours, and bespoke itineraries across the continent.',
    img: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=700&q=80',
    alt: 'Europe travel',
  },
  {
    title: 'Group Packages',
    desc: 'Family reunions, destination weddings, corporate retreats — we handle every detail.',
    img: '/images/group-wedding-beach.jpg',
    alt: 'Group travel',
  },
  {
    title: 'River Cruises',
    desc: 'Specialists in Viking River Cruises and intimate European waterway experiences.',
    img: '/images/river-cruise.jpg',
    alt: 'River cruise',
  },
  {
    title: 'Safaris & Exotic Tours',
    desc: 'Accredited in African Safaris and Australian/New Zealand adventures.',
    img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=700&q=80',
    alt: 'African safari',
  },
]

const TRUST_ITEMS = [
  { icon: '🛡️', label: '35+ Years Experience' },
  { icon: '🌍', label: 'Full-Service Support' },
  { icon: '🏆', label: 'Certified Travel Associates' },
  { icon: '✈️', label: '1,000+ Vacations Planned' },
  { icon: '⭐', label: 'CLIA Master Certified' },
]

const DIFFERENCE = [
  {
    title: 'Personal Advocacy',
    desc: "We're not just booking agents — we're your advocates before, during, and after every trip.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    ),
  },
  {
    title: 'Expert Knowledge',
    desc: 'Our agents are CLIA-certified specialists who have sailed the ships and toured the destinations they recommend.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.93a16 16 0 0 0 6.16 6.16l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    ),
  },
  {
    title: 'No Cost to You',
    desc: 'Our services are complimentary — cruise lines and resorts pay our commissions so you get expert advice for free.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
    ),
  },
  {
    title: 'Exclusive Perks',
    desc: 'Through our industry partnerships, we regularly secure onboard credits, upgrades, and amenities you won\'t find online.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    ),
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('agents')
    .select('*, agent_profiles(*)')
    .order('tier', { ascending: false })
    .order('full_name', { ascending: true })
  const agents = (data || []) as AgentWithProfile[]

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
        <Image
          src="/images/beach.jpg"
          alt="Tropical beach destination"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: 'center 40%' }}
        />
        <div className="absolute inset-0 bg-navy/60" />
        <div className="relative z-10 max-w-3xl px-6 animate-[fadeUp_1.1s_ease_both]">
          <p className="text-[0.75rem] font-bold tracking-[0.2em] uppercase text-gold mb-4">
            ✦ Florida Seller of Travel #40802 ✦
          </p>
          <h1 className="text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.1] text-white mb-6">
            Are You Ready for Your<br />
            <em className="not-italic text-gold">Next Adventure?</em>
          </h1>
          <p className="text-lg text-white/85 leading-relaxed max-w-xl mx-auto mb-8">
            Let our team of experienced travel specialists craft your dream vacation — from luxury cruises and all-inclusive resorts to European escapes and group getaways.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#contact" className="bg-gold text-navy font-bold uppercase tracking-wider text-sm px-8 py-3.5 rounded hover:bg-gold-hover transition-all hover:-translate-y-0.5 no-underline">
              Plan My Trip
            </a>
            <a href="#team" className="border-2 border-white/50 text-white font-bold uppercase tracking-wider text-sm px-8 py-3.5 rounded hover:border-gold transition-all hover:-translate-y-0.5 no-underline">
              Meet Our Agents
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50 text-[0.7rem] tracking-[0.15em] uppercase">
          <span>Scroll</span>
          <span className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-gold py-3.5 px-[5%] flex items-center justify-center gap-8 md:gap-12 flex-wrap">
        {TRUST_ITEMS.map(item => (
          <div key={item.label} className="flex items-center gap-2 text-navy text-[0.8rem] font-bold tracking-[0.05em] uppercase">
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* The PAC and GO Difference */}
      <section className="py-24 px-[5%]" id="about">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">Why Choose Us</p>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.2] text-navy mb-5">
              The PAC and GO<br />Travel Difference
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              We&apos;re not just booking agents — we&apos;re your advocates before, during, and after your trip. Our relationship with every client is the foundation of everything we do.
            </p>
            <div className="flex flex-col gap-6">
              {DIFFERENCE.map(d => (
                <div key={d.title} className="flex gap-4">
                  <div className="w-10 h-10 flex-shrink-0 bg-navy rounded-lg flex items-center justify-center text-gold">
                    {d.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-navy mb-1 text-base">{d.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-[420px] rounded-xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&q=80"
              alt="Cruise ship at sea"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="bg-navy py-24 px-[5%]" id="specialties">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">What We Do Best</p>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] text-white leading-[1.2] mb-4">
              Every Dream Destination,<br />Every Style of Travel
            </h2>
            <p className="text-white/70 max-w-xl mx-auto">
              From Caribbean cruises to African safaris, we specialize in crafting unforgettable journeys for individuals, couples, families, and groups.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIALTIES.map(s => (
              <div key={s.title} className="relative h-[280px] rounded-lg overflow-hidden group cursor-pointer">
                <Image src={s.img} alt={s.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-bold text-lg mb-1">{s.title}</h3>
                  <p className="text-white/75 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote banner */}
      <div className="bg-light py-12 px-[5%] text-center">
        <blockquote className="text-[clamp(1.1rem,2.5vw,1.5rem)] italic text-navy/70 max-w-2xl mx-auto">
          &ldquo;Travel is the only thing you buy that makes you richer.&rdquo;
        </blockquote>
        <cite className="block mt-3 text-xs font-bold tracking-widest uppercase text-gold">— Anonymous</cite>
      </div>

      {/* Meet Our Team */}
      <section className="py-24 px-[5%]" id="team">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">The People Behind the Journeys</p>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] text-navy leading-[1.2]">Meet Our Travel Specialists</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {agents.map(agent => {
              const profile = agent.agent_profiles
              const url = agentProfileUrl(agent.slug, agent.tier)
              return (
                <a
                  key={agent.id}
                  href={url}
                  className="group border border-light rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 no-underline"
                >
                  <div className="h-[220px] bg-light relative overflow-hidden flex items-center justify-center">
                    {profile?.photo_url ? (
                      <Image
                        src={profile.photo_url}
                        alt={agent.full_name}
                        fill
                        className="object-cover object-top"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-navy flex items-center justify-center text-3xl font-bold text-gold">
                        {initials(agent.full_name)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {agent.tier === 'agent_plus' && (
                      <span className="inline-block bg-gold/10 text-gold text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2">
                        Agent+
                      </span>
                    )}
                    <h3 className="text-navy font-bold text-base leading-tight">{agent.full_name}</h3>
                    {profile?.tagline && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{profile.tagline}</p>
                    )}
                    <p className="text-gold text-xs font-bold uppercase tracking-wider mt-3 group-hover:underline">View Profile →</p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Intake form */}
      <IntakeForm />
    </>
  )
}
