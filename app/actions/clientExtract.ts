'use server'

import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { createClient } from '@/lib/supabase/server'
import type { ClientPreferences, LoyaltyEntry } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MAX_INPUT_CHARS = 20000

export type ExtractedWish = {
  destination: string
  trip_type: string | null
  timeframe: string | null
  budget: string | null
  notes: string | null
}

export type ExtractedProfile = {
  full_name: string | null
  preferred_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  dob: string | null
  anniversary: string | null
  citizenship: string | null
  passport_expiry: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  loyalty: LoyaltyEntry[]
  preferences: ClientPreferences
  tags: string[]
  wishes: ExtractedWish[]
  notes: string | null
}

const str = { type: ['string', 'null'] } as const

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'full_name', 'preferred_name', 'email', 'phone', 'address', 'dob', 'anniversary',
    'citizenship', 'passport_expiry', 'emergency_contact_name', 'emergency_contact_phone',
    'loyalty', 'preferences', 'tags', 'wishes', 'notes',
  ],
  properties: {
    full_name: str,
    preferred_name: str,
    email: str,
    phone: str,
    address: str,
    dob: str,
    anniversary: str,
    citizenship: str,
    passport_expiry: str,
    emergency_contact_name: str,
    emergency_contact_phone: str,
    loyalty: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['program', 'number', 'tier'],
        properties: { program: { type: 'string' }, number: { type: 'string' }, tier: str },
      },
    },
    preferences: {
      type: 'object',
      additionalProperties: false,
      required: ['cabin', 'dining', 'accessibility', 'dietary', 'travel_style'],
      properties: { cabin: str, dining: str, accessibility: str, dietary: str, travel_style: str },
    },
    tags: { type: 'array', items: { type: 'string' } },
    wishes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['destination', 'trip_type', 'timeframe', 'budget', 'notes'],
        properties: { destination: { type: 'string' }, trip_type: str, timeframe: str, budget: str, notes: str },
      },
    },
    notes: str,
  },
} as const

const SYSTEM_PROMPT = `You help a travel agent keep client records. The agent pastes an email thread, call notes, or a booking confirmation about ONE client. Pull out facts about that client for their profile.

Rules:
- Only record what the text states or clearly implies. Leave a field null (or an empty list) rather than guess.
- If several people appear, profile the main client: the person the agent is corresponding with or the lead traveller. Mention companions in notes (for example "Travels with husband Mark").
- Dates (dob, anniversary, passport_expiry) must be YYYY-MM-DD. If the year or day is unknown, use null.
- Never output passport numbers, credit card numbers, or other ID numbers except loyalty program member numbers. Record only the passport's expiry date.
- loyalty: one entry per program, with the program's full name (for example "Royal Caribbean Crown & Anchor", "Celebrity Captain's Club", "Delta SkyMiles") and the tier if stated.
- preferences: short phrases. cabin (e.g. "balcony, midship"), dining, accessibility (mobility, hearing, etc.), dietary, travel_style (e.g. "active excursions, avoids big crowds").
- tags: a few short labels only when well supported, such as "honeymoon", "multi-generational", "repeat cruiser", "group leader".
- wishes: trips the client says they want to take some day, one per destination.
- notes: one to three sentences of useful context that fits nowhere else. Null if nothing.`

export async function extractClientProfile(text: string): Promise<ExtractedProfile> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const input = typeof text === 'string' ? text.trim() : ''
  if (!input) throw new Error('Paste some text first.')
  if (input.length > MAX_INPUT_CHARS) {
    throw new Error(`That's too long to read in one go (${input.length.toLocaleString()} characters). Paste the most relevant part, up to ${MAX_INPUT_CHARS.toLocaleString()}.`)
  }

  let response
  try {
    response = await anthropic.messages.parse({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: {
        effort: 'low',
        format: jsonSchemaOutputFormat(SCHEMA),
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: input }],
    })
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) throw new Error('The AI is busy right now. Try again in a minute.')
    if (e instanceof Anthropic.APIError) throw new Error(`AI request failed (${e.status ?? 'network'}).`)
    throw e
  }

  if (response.stop_reason === 'refusal') throw new Error("The AI couldn't process that text. Fill the fields in by hand.")
  if (response.stop_reason === 'max_tokens' || !response.parsed_output) {
    throw new Error("The AI's answer came back incomplete. Try a shorter excerpt.")
  }

  const out = response.parsed_output
  const iso = (v: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null)
  return {
    ...out,
    dob: iso(out.dob),
    anniversary: iso(out.anniversary),
    passport_expiry: iso(out.passport_expiry),
    loyalty: out.loyalty.map(l => ({ program: l.program, number: l.number, tier: l.tier })),
  }
}
