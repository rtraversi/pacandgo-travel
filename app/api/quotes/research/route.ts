import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const body = await request.json()
  const { line, ship, start_date, nights, room_category } = body

  if (!line || !ship) {
    return NextResponse.json({ error: 'Cruise line and ship name are required' }, { status: 400 })
  }

  const nightsNum = parseInt(nights) || 7
  const totalDays = nightsNum + 1

  const prompt = `You are a cruise travel expert helping a travel agent create a detailed customer quote.

IMPORTANT — ship name accuracy: Ship names are sometimes reused by different cruise lines, or a ship may have been renamed or transferred. Do NOT assume you know which ship this is based solely on the name. Use ALL the sailing details below (cruise line, departure date, duration, and especially the itinerary type implied by the dates/nights) to identify the correct, current vessel. If the ship name is ambiguous or you are not certain of its current configuration, base your description on what is realistic for this cruise line and itinerary type rather than risking outdated details.

Sailing Details:
- Cruise Line: ${line}
- Ship: ${ship}
${start_date ? `- Departure Date: ${start_date}` : ''}
- Duration: ${nightsNum} nights
${room_category ? `- Room Category: ${room_category}` : ''}

Return ONLY valid JSON, no markdown fences, no explanation:
{
  "ship_description": "Write 2-3 detailed paragraphs about this ship as it is currently operated by ${line}. Cover the ship's overall experience, size, signature dining venues, entertainment, onboard amenities, pools, spa, and what makes it a great choice for this itinerary. If you are not certain of the exact ship specs, write accurate general information for a ${line} ship of this class.",
  "itinerary": [
    {
      "day": 1,
      "port": "City, Country (or 'At Sea')",
      "description": "For embarkation day: arrival info and boarding experience. For port days: top activities, must-see landmarks, tips. For sea days: onboard activities and highlights. For disembarkation: morning and departure logistics."
    }
  ],
  "highlights": [
    "Specific selling point about this ship or itinerary",
    "Another specific highlight",
    "Another specific highlight",
    "Another specific highlight",
    "Another specific highlight"
  ],
  "included": [
    "All meals in main dining room and buffet",
    "Entertainment (Broadway-style shows, live music)",
    "Use of pools, fitness center, and public areas",
    "Kids clubs and family programming",
    "Room service (standard menu)"
  ],
  "ports_detail": [
    {
      "port": "Port Name, Country",
      "description": "2-3 sentences about this destination — what it's known for, the vibe, why cruisers love it.",
      "highlights": ["Top activity 1", "Top activity 2", "Top attraction 3"]
    }
  ]
}

Rules:
- itinerary must have exactly ${totalDays} entries (Day 1 = embarkation, Day ${totalDays} = disembarkation)
- Build the itinerary based on the sailing region implied by the departure date, duration, and cruise line — a transatlantic will have many sea days; a Caribbean will have frequent port stops, etc.
- ports_detail covers ALL port stops (exclude sea days, embark/disembark days)
- included: list what ${line} actually includes (not excursions, not gratuities, not specialty dining unless free)
- highlights: make them relevant to this specific itinerary type and ship class
- If uncertain about a specific ship detail, give accurate general information rather than inventing specifics
- All fields are required`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = raw.replace(/```json\s*|\s*```/g, '').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json(parsed)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Research failed' }, { status: 500 })
  }
}
