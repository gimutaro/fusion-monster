import { NextResponse } from 'next/server'
import { getSysPrompt, parseAIResponse } from '@/lib/api/prompts'
import type { CharacterStats, ModelPosition } from '@/types/game'

interface GenerateRequest {
  prompt: string
  apiKey: string
}

interface GenerateResponse {
  model: ModelPosition
  stats: CharacterStats
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json()
    const { prompt, apiKey } = body

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 5500,
        system: getSysPrompt(),
        messages: [{
          role: 'user',
          content: `Create DETAILED 3D character: ${prompt}. JSON with "model" and "stats". 20-30 parts. Each limb ONE mesh!`
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
    const stats: CharacterStats = parsed.stats as CharacterStats || {
      name: prompt,
      hp: 50 + Math.floor(Math.random() * 200),
      attack: 20 + Math.floor(Math.random() * 100),
      defense: 20 + Math.floor(Math.random() * 100),
      speed: 20 + Math.floor(Math.random() * 100),
      element: ['fire', 'water', 'wind', 'earth', 'dark', 'light'][Math.floor(Math.random() * 6)] as CharacterStats['element'],
      rarity: 1 + Math.floor(Math.random() * 5),
      trait: 'A mysterious being whose true identity is unknown. They possess strange powers, emanating magic so intense it warps the air around them.'
    }

    const result: GenerateResponse = { model, stats }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
