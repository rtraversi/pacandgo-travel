import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Excursions' }

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
        <h1 className="text-[clamp(2rem,4vw,3.2rem)] text-white">Shore Excursions & Add-Ons</h1>
        <p className="text-white/70 mt-4 max-w-xl mx-auto">
          The best travel experiences happen off the beaten path. Our agents know exactly which excursions deliver unforgettable memories.
        </p>
      </div>

      <div className="py-20 px-[5%] max-w-6xl mx-auto">
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
                    <span key={tag} className="bg-light text-navy text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded">
                      {tag}
                    </span>
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
