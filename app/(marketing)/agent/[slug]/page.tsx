import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AgentContactForm from '@/components/agent/AgentContactForm'
import { formatDate, formatPrice, initials } from '@/lib/utils'
import { AGENT_EMAILS } from '@/lib/emailjs'
import type { Agent, AgentProfile, Deal, Trip, Review, GalleryItem, BlogPost, Highlight } from '@/lib/types'

type PageAgent = Agent & { agent_profiles: AgentProfile | null }

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('agents').select('full_name, agent_profiles(tagline)').eq('slug', slug).single()
  if (!data) return { title: 'Agent Not Found' }
  const agent = data as { full_name: string; agent_profiles: { tagline: string | null } | null }
  return {
    title: agent.full_name,
    description: agent.agent_profiles?.tagline || `Book your dream vacation with ${agent.full_name} at PAC and GO Travel.`,
  }
}

export default async function AgentProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const agentRes = await supabase.from('agents').select('*, agent_profiles(*)').eq('slug', slug).single()
  const agent = agentRes.data as PageAgent | null
  if (!agent) notFound()

  const aid = agent.id
  const [dealsRes, tripsRes, reviewsRes, galleryRes, blogRes] = await Promise.all([
    supabase.from('deals').select('*').eq('agent_id', aid).eq('active', true).order('created_at', { ascending: false }),
    supabase.from('trips').select('*').eq('agent_id', aid).eq('active', true).order('date_from', { ascending: true }),
    supabase.from('reviews').select('*').eq('agent_id', aid).eq('status', 'approved').order('created_at', { ascending: false }),
    supabase.from('gallery').select('*').eq('agent_id', aid).eq('active', true).order('order_index', { ascending: true }),
    supabase.from('blog_posts').select('*').eq('agent_id', aid).eq('active', true).order('publish_date', { ascending: false }),
  ])

  const profile = agent.agent_profiles
  const deals = (dealsRes.data || []) as Deal[]
  const trips = (tripsRes.data || []) as Trip[]
  const reviews = (reviewsRes.data || []) as Review[]
  const gallery = (galleryRes.data || []) as GalleryItem[]
  const blog = (blogRes.data || []) as BlogPost[]
  const highlights = (profile?.highlights || []) as Highlight[]
  const agentEmail = AGENT_EMAILS[slug] || AGENT_EMAILS.any

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end pb-16 px-[5%] overflow-hidden bg-navy">
        {profile?.photo_url && (
          <>
            <Image src={profile.photo_url} alt={agent.full_name} fill className="object-cover object-top opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-transparent" />
          </>
        )}
        <div className="relative z-10 max-w-3xl">
          {agent.tier === 'agent_plus' && (
            <span className="inline-block bg-gold text-navy text-[0.7rem] font-bold uppercase tracking-widest px-3 py-1 rounded mb-4">
              Agent+
            </span>
          )}
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] text-white leading-[1.1] mb-3">{agent.full_name}</h1>
          {profile?.tagline && <p className="text-xl text-gold italic">{profile.tagline}</p>}
          <a href="#contact" className="mt-6 inline-block bg-gold text-navy font-bold uppercase tracking-wider text-sm px-8 py-3.5 rounded hover:bg-gold-hover transition-colors no-underline">
            Book with Me
          </a>
        </div>
      </section>

      {/* Credential Highlights */}
      {highlights.length > 0 && (
        <section className="bg-navy-dark py-16 px-[5%]">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {highlights.map((h, i) => (
              <div key={i} className="text-center p-5 border border-white/10 rounded-xl">
                <div className="text-3xl mb-3">{h.icon}</div>
                <h3 className="text-gold font-bold text-sm uppercase tracking-wider mb-2">{h.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{h.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bio */}
      {(profile?.bio || (profile?.specialties && profile.specialties.length > 0)) && (
        <section className="py-20 px-[5%] bg-white">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">About Me</p>
              <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] text-navy mb-5">
                {profile?.tagline || `Your Travel Specialist`}
              </h2>
              {profile?.bio && (
                <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed">
                  {profile.bio.split('\n').map((para, i) => para.trim() ? <p key={i}>{para}</p> : null)}
                </div>
              )}
            </div>
            <div>
              {!profile?.photo_url && (
                <div className="w-full aspect-square rounded-xl bg-light flex items-center justify-center text-6xl font-bold text-navy mb-6">
                  {initials(agent.full_name)}
                </div>
              )}
              {profile?.specialties && profile.specialties.length > 0 && (
                <>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-navy mb-3">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map(s => (
                      <span key={s} className="bg-light text-navy text-xs font-semibold px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Deals */}
      {profile?.show_deals !== false && deals.length > 0 && (
        <section className="py-20 px-[5%] bg-sand">
          <div className="max-w-5xl mx-auto">
            <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">Exclusive Offers</p>
            <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] text-navy mb-10">Current Deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map(deal => (
                <div key={deal.id} className="bg-white rounded-xl p-6 border border-light shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xs font-bold uppercase tracking-wider text-gold mb-2">{deal.line}</div>
                  <h3 className="text-navy font-bold text-lg mb-1">{deal.title || deal.ship}</h3>
                  {deal.description && <p className="text-gray-500 text-sm mb-4 line-clamp-3">{deal.description}</p>}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-light">
                    {deal.price && <span className="text-2xl font-bold text-navy">{formatPrice(deal.price)}<span className="text-sm text-gray-400 font-normal">/pp</span></span>}
                    {deal.date_from && <span className="text-xs text-gray-400">{formatDate(deal.date_from)}</span>}
                  </div>
                  {deal.ports && <p className="text-xs text-gray-400 mt-2">📍 {deal.ports}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Trips */}
      {profile?.show_trips !== false && trips.length > 0 && (
        <section className="py-20 px-[5%] bg-white">
          <div className="max-w-5xl mx-auto">
            <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">Join the Adventure</p>
            <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] text-navy mb-10">Upcoming Group Trips</h2>
            <div className="flex flex-col gap-4">
              {trips.map(trip => (
                <div key={trip.id} className="border border-light rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-gold mb-1">{trip.line} — {trip.ship}</div>
                    <h3 className="text-navy font-bold text-lg">{trip.title || trip.ship}</h3>
                    {trip.description && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{trip.description}</p>}
                    {trip.ports && <p className="text-xs text-gray-400 mt-2">📍 {trip.ports}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right flex-shrink-0">
                    {trip.date_from && <span className="text-sm font-semibold text-navy">{formatDate(trip.date_from)}</span>}
                    {trip.price && <span className="text-2xl font-bold text-gold">{formatPrice(trip.price)}<span className="text-xs text-gray-400 font-normal">/pp</span></span>}
                    {trip.spots && <span className="text-xs text-gray-400">{trip.spots} spots available</span>}
                    <a href="#contact" className="mt-2 bg-gold text-navy text-xs font-bold uppercase tracking-wider px-4 py-2 rounded hover:bg-gold-hover transition-colors no-underline">
                      Reserve Spot
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {profile?.show_reviews !== false && reviews.length > 0 && (
        <section className="py-20 px-[5%] bg-navy">
          <div className="max-w-5xl mx-auto">
            <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">Kind Words</p>
            <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] text-white mb-10">What Clients Are Saying</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex mb-3">
                    {Array.from({ length: review.stars || 5 }).map((_, i) => (
                      <span key={i} className="text-gold text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-white/85 text-sm leading-relaxed mb-4 italic">&ldquo;{review.review_text}&rdquo;</p>
                  <div>
                    <p className="text-white font-semibold text-sm">{review.client_name}</p>
                    {review.trip_type && <p className="text-gold text-xs mt-0.5">{review.trip_type}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {profile?.show_gallery !== false && gallery.length > 0 && (
        <section className="py-20 px-[5%] bg-white">
          <div className="max-w-5xl mx-auto">
            <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">My Travel Journey</p>
            <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] text-navy mb-10">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {gallery.map(item => (
                <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden group">
                  <Image
                    src={item.image_url}
                    alt={item.alt_text || item.caption || 'Travel photo'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {item.caption && (
                    <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-xs">{item.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog */}
      {profile?.show_blog !== false && blog.length > 0 && (
        <section className="py-20 px-[5%] bg-light">
          <div className="max-w-5xl mx-auto">
            <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">Insights & Stories</p>
            <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] text-navy mb-10">From My Blog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blog.map(post => (
                <a
                  key={post.id}
                  href={post.url || '#'}
                  className="bg-white rounded-xl p-6 border border-light hover:shadow-md transition-shadow no-underline group"
                  target={post.url ? '_blank' : undefined}
                  rel={post.url ? 'noopener noreferrer' : undefined}
                >
                  {post.tags && post.tags.length > 0 && (
                    <span className="inline-block bg-gold/10 text-gold text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-3">
                      {post.tags[0]}
                    </span>
                  )}
                  <h3 className="text-navy font-bold text-base leading-snug mb-2 group-hover:text-ocean transition-colors">{post.title}</h3>
                  {post.description && <p className="text-gray-500 text-sm line-clamp-3">{post.description}</p>}
                  {post.publish_date && <p className="text-gray-400 text-xs mt-4">{formatDate(post.publish_date)}</p>}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <AgentContactForm agentEmail={agentEmail} agentName={agent.full_name} />
    </>
  )
}
