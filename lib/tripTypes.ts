import { CRUISE_LINES } from '@/lib/utils'

/**
 * Deals and trips started out cruise-only, so their columns are still named
 * line / ship / ports. For other kinds of trip those columns hold the supplier,
 * the product name and the places visited; this file says how to label them.
 */
export const TRIP_TYPES = ['cruise', 'tour', 'theme_park', 'resort', 'other'] as const
export type TripType = (typeof TRIP_TYPES)[number]

export function isTripType(v: unknown): v is TripType {
  return typeof v === 'string' && (TRIP_TYPES as readonly string[]).includes(v)
}

type TripTypeConfig = {
  label: string
  supplier: string
  supplierPlaceholder: string
  product: string
  productPlaceholder: string
  places: string
  placesPlaceholder: string
  suggestions: readonly string[]
}

export const TRIP_TYPE_CONFIG: Record<TripType, TripTypeConfig> = {
  cruise: {
    label: 'Cruise',
    supplier: 'Cruise Line',
    supplierPlaceholder: 'Royal Caribbean',
    product: 'Ship',
    productPlaceholder: 'Wonder of the Seas',
    places: 'Ports of Call',
    placesPlaceholder: 'Nassau, Cozumel, Grand Cayman',
    suggestions: CRUISE_LINES,
  },
  tour: {
    label: 'Tour',
    supplier: 'Tour Company',
    supplierPlaceholder: 'Globus',
    product: 'Tour Name',
    productPlaceholder: 'Italian Holiday',
    places: 'Places Visited',
    placesPlaceholder: 'Rome, Florence, Venice',
    suggestions: [
      'Globus', 'Cosmos', 'Avalon Waterways', 'Trafalgar', 'Insight Vacations', 'Contiki', 'Collette',
      'Tauck', 'Gate 1 Travel', 'G Adventures', 'Intrepid Travel', 'Adventures by Disney', 'Road Scholar',
      'Abercrombie & Kent', 'EF Go Ahead Tours', 'Rick Steves Europe',
    ],
  },
  theme_park: {
    label: 'Theme Park',
    supplier: 'Destination',
    supplierPlaceholder: 'Walt Disney World',
    product: 'Hotel or Package',
    productPlaceholder: "Disney's Polynesian Village Resort",
    places: 'Parks & Highlights',
    placesPlaceholder: 'Magic Kingdom, EPCOT, Hollywood Studios',
    suggestions: [
      'Walt Disney World', 'Disneyland Resort', 'Disneyland Paris', 'Tokyo Disney Resort',
      'Hong Kong Disneyland', 'Shanghai Disney Resort', 'Universal Orlando Resort',
      'Universal Studios Hollywood', 'SeaWorld Orlando', 'LEGOLAND',
    ],
  },
  resort: {
    label: 'Resort',
    supplier: 'Resort Brand',
    supplierPlaceholder: 'Sandals',
    product: 'Property',
    productPlaceholder: 'Sandals Royal Bahamian',
    places: 'Location & Highlights',
    placesPlaceholder: 'Nassau, Bahamas · private offshore island',
    suggestions: [
      'Sandals', 'Beaches', 'Club Med', 'Secrets', 'Dreams', 'Breathless', 'Zoëtry', 'Hyatt Ziva',
      'Hyatt Zilara', 'Excellence', 'Iberostar', 'Hard Rock Hotels', 'Atlantis', 'Aulani',
    ],
  },
  other: {
    label: 'Other',
    supplier: 'Company',
    supplierPlaceholder: 'Supplier or operator',
    product: 'Trip Name',
    productPlaceholder: 'Name of the trip or package',
    places: 'Destinations',
    placesPlaceholder: 'Where it goes',
    suggestions: [],
  },
}

/** Rows saved before trip types existed have no value; treat them as cruises. */
export function tripTypeOf(item: { trip_type?: string | null }): TripType {
  return isTripType(item.trip_type) ? item.trip_type : 'cruise'
}
