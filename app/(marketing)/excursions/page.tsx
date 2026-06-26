import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Excursions & Tours' }

const DESTINATIONS = [
  { label: '🏰 Europe' },
  { label: '🌴 Caribbean' },
  { label: '🌮 Mexico' },
  { label: '🌺 Hawaii' },
  { label: '🏯 Asia' },
  { label: '🦁 Africa' },
  { label: '🦘 Australia & NZ' },
  { label: '🌍 All Destinations' },
]

const EXCURSIONS = [
  {
    title: 'Caribbean Shore Excursions',
    desc: 'From snorkeling in Cozumel to zip-lining in St. Lucia — we know which shore excursions are worth your time and money.',
    img: 'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=700&q=80',
    tags: ['Snorkeling', 'Beach', 'Cultural', 'Adventure'],
  },
  {
    title: 'Mediterranean Day Trips',
    desc: 'Private tours of the Colosseum, wine tastings in Tuscany, and sunset cruises along the Amalfi Coast.',
    img: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=700&q=80',
    tags: ['History', 'Culture', 'Food & Wine', 'Scenic'],
  },
  {
    title: 'Alaskan Wilderness',
    desc: 'Whale watching in Juneau, glacier hikes near Skagway, and floatplane tours over Denali.',
    img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=80',
    tags: ['Wildlife', 'Glacier', 'Hiking', 'Floatplane'],
  },
  {
    title: 'European River Excursions',
    desc: 'Guided bike rides through the Rhine Valley, Christmas market visits, and castle tours along the Danube.',
    img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=700&q=80',
    tags: ['Cycling', 'Castles', 'Markets', 'Historic'],
  },
  {
    title: 'African Safari Add-Ons',
    desc: 'Combine a Southern African safari with Victoria Falls or a Kruger Park bush walk.',
    img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=700&q=80',
    tags: ['Big 5', 'Safari', 'Bush Walk', 'Photography'],
  },
  {
    title: 'Hawaii Island Hopping',
    desc: 'Helicopter rides over the Napali Coast, luaus on the Big Island, and snorkeling with manta rays.',
    img: 'https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=700&q=80',
    tags: ['Helicopter', 'Snorkeling', 'Luau', 'Volcano'],
  },
]

export default function ExcursionsPage() {
  return (
    <>
      <div className="bg-navy py-20 px-[5%] text-center">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-3">Beyond the Ship</p>
        <h1 className="text-[clamp(2rem,4vw,3.2rem)] text-white">Shore Excursions & Tours</h1>
        <p className="text-white/70 mt-4 max-w-xl mx-auto">
          The best travel experiences happen off the beaten path. Our agents know exactly which excursions deliver unforgettable memories.
        </p>
      </div>

      <div className="py-20 px-[5%] max-w-6xl mx-auto">

        {/* Viator Partner Section */}
        <div className="mb-16">
          <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">Our Booking Partner</p>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] text-navy mb-8">Thousands of Experiences Worldwide</h2>

          <div className="border border-light rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-navy px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-gold text-xs font-bold uppercase tracking-widest mb-1">Featured Partner</div>
                <h3 className="text-white text-2xl font-bold">Viator</h3>
                <p className="text-white/60 text-sm mt-1">World&apos;s largest tours &amp; experiences marketplace · 300,000+ activities</p>
              </div>
              <a
                href="https://www.viator.com/?pid=P00002449&uid=U00002894&mcid=58086&currency=USD"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gold text-navy font-bold uppercase tracking-wider text-sm px-7 py-3 rounded hover:bg-gold-hover transition-colors no-underline whitespace-nowrap"
              >
                Browse Viator →
              </a>
            </div>

            <div className="px-8 py-6">
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                Viator is the world&apos;s leading marketplace for travel experiences — with over 300,000 tours, activities, shore excursions,
                and day trips across every destination on the planet. Backed by TripAdvisor, every listing includes verified traveler reviews
                so you can book with confidence.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {['300,000+ Experiences', 'Free Cancellation Options', 'Verified Reviews', 'Shore Excursions', 'Skip-the-Line Tours', 'Private & Group Options', 'Instant Confirmation', '24/7 Support'].map(pill => (
                  <span key={pill} className="bg-light text-navy text-[0.65rem] font-bold uppercase tracking-wide px-3 py-1 rounded-full">{pill}</span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {DESTINATIONS.map(d => (
                  <a
                    key={d.label}
                    href={`https://www.viator.com/?pid=P00002449&uid=U00002894&mcid=58086&currency=USD`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-navy/5 hover:bg-gold/10 text-navy text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors no-underline"
                  >
                    {d.label}
                  </a>
                ))}
              </div>

              <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
                <p className="text-navy text-sm">
                  <span className="font-bold">💡 Pro Tip from Our Agents:</span>{' '}
                  Cruise line excursions are convenient, but third-party operators like Viator often offer the same tours at lower prices — with more
                  unique options. The key rule: if your excursion is booked through the cruise line, the ship waits for you. If not, book operators
                  with strong reviews and early return guarantees. Not sure?{' '}
                  <Link href="/contact" className="text-ocean font-semibold hover:underline">Ask your agent</Link> — we&apos;ve been to these ports and know who to trust.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Destination Cards */}
        <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">Inspiration by Region</p>
        <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] text-navy mb-8">Popular Excursion Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {EXCURSIONS.map(ex => (
            <div key={ex.title} className="rounded-xl overflow-hidden border border-light hover:shadow-xl transition-shadow group">
              <div className="relative h-[220px] overflow-hidden">
                <Image
                  src={ex.img}
                  alt={ex.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-navy font-bold text-xl mb-2">{ex.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{ex.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {ex.tags.map(tag => (
                    <span key={tag} className="bg-light text-navy text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

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
