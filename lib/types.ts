export type AgentTier = 'agent' | 'agent_plus'
export type ReviewStatus = 'pending' | 'approved' | 'denied'
export type MediaType = 'photo' | 'video'

export interface Agent {
  id: string
  user_id: string | null
  slug: string
  full_name: string
  email: string
  tier: AgentTier
  created_at: string
}

export interface AgentProfile {
  id: string
  agent_id: string
  photo_url: string | null
  tagline: string | null
  bio: string | null
  specialties: string[]
  highlights: Highlight[]
  show_deals: boolean
  show_trips: boolean
  show_blog: boolean
  show_reviews: boolean
  show_gallery: boolean
  blog_url: string | null
  updated_at: string
}

export interface Highlight {
  icon: string
  title: string
  text: string
}

export interface Deal {
  id: string
  agent_id: string
  title: string | null
  description: string | null
  line: string | null
  ship: string | null
  date_from: string | null
  date_to: string | null
  ports: string | null
  price: number | null
  spots: number | null
  active: boolean
  created_at: string
}

export interface Trip {
  id: string
  agent_id: string
  title: string | null
  description: string | null
  line: string | null
  ship: string | null
  date_from: string | null
  date_to: string | null
  ports: string | null
  price: number | null
  spots: number | null
  active: boolean
  created_at: string
}

export interface BlogPost {
  id: string
  agent_id: string
  title: string
  body: string | null
  url: string | null
  description: string | null
  tags: string[]
  publish_date: string | null
  active: boolean
  created_at: string
}

export interface Review {
  id: string
  agent_id: string
  client_name: string
  trip_type: string | null
  stars: number | null
  review_text: string
  status: ReviewStatus
  created_at: string
}

export interface GalleryItem {
  id: string
  agent_id: string
  image_url: string
  caption: string | null
  alt_text: string | null
  category: string | null
  media_type: MediaType
  order_index: number
  active: boolean
  created_at: string
}

export interface ClientInfo {
  address: string | null
  phone: string | null
  dob: string | null
  loyalty_number: string | null
}

export interface Client {
  id: string
  agent_id: string
  household_id: string | null
  full_name: string
  email: string | null
  phone: string | null
  address: string | null
  dob: string | null
  loyalty_number: string | null
  notes: string | null
  created_at: string
}

export interface Quote {
  id: string
  agent_id: string
  customer_name: string | null
  customer_email: string | null
  client_info: ClientInfo | null
  client_id: string | null
  additional_guest_ids: string[]
  line: string
  ship: string
  start_date: string | null
  nights: number | null
  room_category: string | null
  price: number | null
  guests: number
  ai_data: QuoteAIData
  pdf_url: string | null
  notes: string | null
  created_at: string
}

export interface QuoteAIData {
  itinerary?: ItineraryDay[]
  ship_description?: string
  highlights?: string[]
  included?: string[]
  ports_detail?: PortDetail[]
}

export interface ItineraryDay {
  day: number
  port: string
  description: string
}

export interface PortDetail {
  port: string
  description: string
  highlights: string[]
}

// Joined type used in portal
export interface AgentWithProfile extends Agent {
  agent_profiles: AgentProfile | null
}

// Supabase Database type (used by createClient generic)
export type Database = {
  public: {
    Tables: {
      agents: { Row: Agent; Insert: Omit<Agent, 'id' | 'created_at'>; Update: Partial<Agent> }
      agent_profiles: { Row: AgentProfile; Insert: Omit<AgentProfile, 'id'>; Update: Partial<AgentProfile> }
      deals: { Row: Deal; Insert: Omit<Deal, 'id' | 'created_at'>; Update: Partial<Deal> }
      trips: { Row: Trip; Insert: Omit<Trip, 'id' | 'created_at'>; Update: Partial<Trip> }
      blog_posts: { Row: BlogPost; Insert: Omit<BlogPost, 'id' | 'created_at'>; Update: Partial<BlogPost> }
      reviews: { Row: Review; Insert: Omit<Review, 'id' | 'created_at'>; Update: Partial<Review> }
      gallery: { Row: GalleryItem; Insert: Omit<GalleryItem, 'id' | 'created_at'>; Update: Partial<GalleryItem> }
      quotes: { Row: Quote; Insert: Omit<Quote, 'id' | 'created_at'>; Update: Partial<Quote> }
      clients: { Row: Client; Insert: Omit<Client, 'id' | 'created_at'>; Update: Partial<Client> }
    }
  }
}
