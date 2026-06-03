import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white/70 py-16 px-[5%]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <Image src="/images/logo.png" alt="PAC and GO Travel" width={180} height={54} className="h-12 w-auto mb-4" />
            <p className="text-sm leading-relaxed">
              Your trusted travel experts for cruises, all-inclusive resorts, European adventures, and once-in-a-lifetime journeys.
            </p>
            <p className="text-xs text-gold mt-4 font-semibold">Florida Seller of Travel #40802</p>
            <p className="text-xs mt-1">CLIA Member Agency</p>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              {[
                { label: 'Our Team',   href: '/#team' },
                { label: 'Resources',  href: '/resources' },
                { label: 'Excursions', href: '/excursions' },
                { label: 'Contact',    href: '/contact' },
                { label: 'Agent Login', href: '/login' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-gold transition-colors no-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Start Planning</h4>
            <p className="text-sm mb-4">Ready for your next adventure? Our agents are here to craft your perfect trip.</p>
            <Link
              href="/contact"
              className="inline-block bg-gold text-navy text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded hover:bg-gold-hover transition-colors no-underline"
            >
              Contact Us
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-xs flex flex-col md:flex-row justify-between gap-2">
          <p>© 2026 PAC and GO Travel. All rights reserved.</p>
          <p>Designed with ♥ for travelers everywhere</p>
        </div>
      </div>
    </footer>
  )
}
