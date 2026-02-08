import { NextResponse } from 'next/server'
import { getSysPrompt, parseAIResponse } from '@/lib/api/prompts'
import type { CharacterStats, ModelPosition } from '@/types/game'

interface FusionRequest {
  char1: CharacterStats
  char2: CharacterStats
  isSuper?: boolean
  superMult?: number
}

interface FusionResponse {
  model: ModelPosition
  stats: CharacterStats
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const body: FusionRequest = await request.json()
    const { char1, char2, isSuper, superMult = 1 } = body

    if (!char1 || !char2) {
      return NextResponse.json(
        { error: 'Two characters are required for fusion' },
        { status: 400 }
      )
    }

    const mult = isSuper ? superMult : 1

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 6000,
        system: getSysPrompt(),
        messages: [{
          role: 'user',
          content: `Fuse "${char1.name}"(${char1.element},ATK:${char1.attack},HP:${char1.hp}) and "${char2.name}"(${char2.element},ATK:${char2.attack},HP:${char2.hp}) into POWERFUL hybrid. Mix colors/features. Stats HIGHER than originals. Rarity:min ${Math.max(char1.rarity || 1, char2.rarity || 1) + 1}. 25-35 parts. Emissive glow effects. Cool fusion name!${mult > 1 ? ' This is a SUPER FUSION - make it extra powerful and flashy with more emissive effects!' : ''}`
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', errorText)
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.content?.[0]?.text

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    const parsed = parseAIResponse(content)
    const model = parsed.model as ModelPosition

    let stats: CharacterStats = parsed.stats as CharacterStats || {
      name: `${char1.name}×${char2.name}`,
      hp: Math.floor((char1.hp || 100) * 1.5),
      attack: Math.floor((char1.attack || 50) * 1.3),
      defense: Math.floor((char1.defense || 50) * 1.3),
      speed: Math.floor((char1.speed || 50) * 1.3),
      element: char1.element,
      rarity: Math.min(5, Math.max(char1.rarity || 1, char2.rarity || 1) + 1)
    }

    // Apply Super Fusion multiplier
    if (mult > 1) {
      stats = {
        ...stats,
        hp: Math.round(stats.hp * mult),
        attack: Math.round(stats.attack * mult),
        defense: Math.round(stats.defense * mult),
        speed: Math.round(stats.speed * mult)
      }
    }

    const result: FusionResponse = { model, stats }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Fusion error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
