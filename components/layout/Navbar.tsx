'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const NAV_LINKS = [
  { label: 'Home',       href: '/' },
  { label: 'Our Team',   href: '/#team' },
  { label: 'Resources',  href: '/resources' },
  { label: 'Excursions', href: '/excursions' },
  { label: 'Contact',    href: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[72px] px-[5%] bg-navy/[0.97] backdrop-blur-sm border-b border-gold/30">
      <Link href="/" className="flex items-center">
        <Image
          src="/images/logo.png"
          alt="PAC and GO Travel"
          width={200}
          height={56}
          className="h-14 w-auto"
          priority
        />
      </Link>

      {/* Desktop nav */}
      <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
        {NAV_LINKS.map(l => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-white/85 text-[0.8rem] font-bold tracking-[0.08em] uppercase hover:text-gold transition-colors no-underline"
            >
              {l.label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/login"
            className="bg-gold text-navy text-[0.8rem] font-bold tracking-[0.06em] uppercase px-5 py-2 rounded hover:bg-gold-hover transition-colors no-underline"
          >
            Agent Login
          </Link>
        </li>
      </ul>

      {/* Mobile toggle */}
      <button
        className="md:hidden flex flex-col gap-[5px] p-2"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        <span className="block w-6 h-0.5 bg-white rounded" />
        <span className="block w-6 h-0.5 bg-white rounded" />
        <span className="block w-6 h-0.5 bg-white rounded" />
      </button>

      {open && (
        <div className="absolute top-[72px] left-0 right-0 bg-navy border-b border-gold/30 md:hidden">
          <ul className="flex flex-col p-6 gap-5 list-none m-0">
            {NAV_LINKS.map(l => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-white/85 text-sm font-bold uppercase tracking-wider hover:text-gold transition-colors no-underline"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="inline-block bg-gold text-navy text-sm font-bold uppercase px-5 py-2 rounded no-underline"
                onClick={() => setOpen(false)}
              >
                Agent Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
