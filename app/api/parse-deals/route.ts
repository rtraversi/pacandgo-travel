import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are parsing cruise line promotional emails for a travel agent's public website. Extract consumer-facing deals and STRIP all travel-agent-only content.

STRIP — do not include anything related to:
- Agent bonus commissions ("$X bonus commission per stateroom", "override", "extra commission", "Booked & Elevated", "Booked & Celebrated")
- Agent contests, sweepstakes, or reward programs ("win swag", "agent appreciation", "lucky travel partners")
- Friends & Family rates, Travel Partner rates, FAM trips
- Agent incentive or recognition programs
- Internal promo codes, booking codes, or agent portal links (CruisingPower, Polar Online, etc.)
- Training, webinar, certification, or CLIA/IATA announcements
- Crown & Anchor Society or loyalty program agent tools
- Anything addressed to "travel advisors", "agents", "partners"

EXTRACT — consumer-facing offers only:
- Percentage discounts (BOGO, 60% off 2nd guest, etc.)
- Dollar savings or instant savings
- Onboard credit offers
- Free guest promotions (Kids Sail Free, 3rd/4th Guest Free)
- Ship-specific limited-time deals with savings
- Seasonal or flash sales with clear booking windows

For each deal return a JSON object with exactly these fields:
- title: Short punchy card title (e.g. "BOGO60 — 2nd Guest Sails at 60% Off")
- description: 2–3 consumer-friendly sentences. Include booking deadline, what's included, notable exclusions. Do NOT mention agent commissions or internal codes.
- line: Cruise line name (e.g. "Royal Caribbean", "Celebrity Cruises", "Princess Cruises", "Holland America")
- ship: Specific ship name if deal is ship-specific, otherwise null
- date_from: Booking window open OR sailing window start in YYYY-MM-DD format, or null
- date_to: Booking deadline OR sailing window end in YYYY-MM-DD format, or null
- ports: Comma-separated ports if mentioned, otherwise null
- price: Numeric USD price per person if explicitly stated, otherwise null
- spots: null (always null)
- active: true

Return ONLY a valid JSON array. No markdown fences, no explanation. If no consumer deals found, return [].`

export async function POST(request: Request) {
  const { content } = await request.json()
  if (!content?.trim()) return NextResponse.json({ error: 'No content provided' }, { status: 400 })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Parse this cruise email and return the consumer-facing deals as a JSON array:\n\n${content.slice(0, 12000)}`,
    }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const clean = raw.replace(/```json\s*|\s*```/g, '').trim()

  try {
    const deals = JSON.parse(clean)
    if (!Array.isArray(deals)) return NextResponse.json({ error: 'Unexpected response' }, { status: 500 })
    return NextResponse.json({ deals })
  } catch {
    return NextResponse.json({ error: 'Parse failed', raw }, { status: 500 })
  }
}
