import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const body = await request.json()
  const { type = 'highlights' } = body

  if (type === 'enrich') {
    const { line, ship, ports, dateFrom } = body
    if (!line && !ship) return NextResponse.json({ error: 'Line or ship required' }, { status: 400 })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Write a short travel deal title and 2-3 sentence description for a cruise travel agent website. Return ONLY JSON, no markdown.

Cruise: ${line ?? ''} ${ship ?? ''}${ports ? `, ports: ${ports}` : ''}${dateFrom ? `, departing ${dateFrom}` : ''}

Format: {"title":"...","description":"..."}`,
      }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = raw.replace(/```json\s*|\s*```/g, '').trim()
    try {
      return NextResponse.json(JSON.parse(clean))
    } catch {
      return NextResponse.json({ error: 'Parse failed' }, { status: 500 })
    }
  }

  // type === 'highlights'
  const { bio, agentName } = body
  if (!bio) return NextResponse.json({ error: 'Bio required' }, { status: 400 })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Generate exactly 4 credential highlights for a travel agent profile page. Return ONLY a JSON array, no markdown.

Each highlight: icon (emoji), title (2–4 words, Title Case), text (1–2 sentences).

Agent: ${agentName}
Bio: ${bio}

Format: [{"icon":"🚢","title":"Cruise Expert","text":"Sentence here."},...]`,
    }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const clean = raw.replace(/```json\s*|\s*```/g, '').trim()
  try {
    return NextResponse.json({ highlights: JSON.parse(clean) })
  } catch {
    return NextResponse.json({ error: 'Parse failed' }, { status: 500 })
  }
}
