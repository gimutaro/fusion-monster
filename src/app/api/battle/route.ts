import { NextResponse } from 'next/server'
import type { CharacterStats, BattleEvent } from '@/types/game'
import { pickDramaEvents } from '@/lib/game/battle'

interface BattleRequest {
  partyStats: CharacterStats[]
  fusionStats: CharacterStats
  boss: CharacterStats & { name: string }
  stage: number
  winner: 'party' | 'boss'
}

interface BattleResponse {
  events: BattleEvent[]
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

    const body: BattleRequest = await request.json()
    const { partyStats, fusionStats, boss, stage, winner } = body

    if (!partyStats || !fusionStats || !boss) {
      return NextResponse.json(
        { error: 'Missing battle data' },
        { status: 400 }
      )
    }

    const dramaEvents = pickDramaEvents(2)
    const dramaDesc = dramaEvents.map((d, i) => `DRAMA${i + 1}: ${d.desc}`).join('\n')
    const partyInfo = partyStats.map(p =>
      `${p.name}(HP:${p.hp},ATK:${p.attack},DEF:${p.defense},SPD:${p.speed},属性:${p.element})`
    ).join(', ')

    const systemPrompt = `You are a dramatic RPG battle script writer who creates exciting, emotional battle narratives. Output ONLY a valid JSON array. No markdown.

The battle outcome is decided: winner is "${winner}". Write narrative leading to this result.

Mandatory dramatic twists:
${dramaDesc}

WRITING STYLE:
- Write passionate, emotional dialogue that shows each character's personality
- Dialogue should be 1-2 sentences, dramatic and impactful
- Short narration (under 15 chars) is OK before dialogue to set the scene
- Format: short context + キャラ名「熱いセリフ！」
- Examples of GOOD text:
  "炎の剣士「まだだ…まだ終わらせない！仲間がいる限り、俺は倒れない！」"
  "渾身の一撃！ダークドラゴン「グォォォ！貴様ら、この痛み…許さんぞ！」"
  "氷の狼「主よ、今こそ牙を見せる時だ」"
- Make battles feel like anime climax scenes with tension, emotion, and hype
- Characters should shout, taunt, encourage teammates, express pain and determination
- Boss should be menacing and arrogant, then shocked when losing

Event types: {"actor":"name","target":"name","action":"attack"|"special"|"drama"|"fusion_arrive"|"result","damage":number,"text":"Japanese","crit":bool}
fusion_arrive: {"actor":"SYSTEM","action":"fusion_arrive","fusionName":"${fusionStats.name}","damage":0,"target":"","text":"${fusionStats.name}「dramatic entrance line」","crit":false}
result: {"actor":"SYSTEM","action":"result","winner":"${winner}","damage":0,"target":"","text":"final dramatic line","crit":false}
CRITICAL: winner MUST be "${winner}". Fusion name EXACTLY "${fusionStats.name}".
Damage values should be between 30-150.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Generate 12-15 battle events with dramatic, anime-style dialogue!
Winner: ${winner}
PARTY: ${partyInfo}
BOSS: ${boss.name}(HP:${boss.hp},ATK:${boss.attack},DEF:${boss.defense},属性:dark) [STAGE ${stage}]
FUSION: ${fusionStats.name}(HP:${fusionStats.hp},ATK:${fusionStats.attack},DEF:${fusionStats.defense},属性:${fusionStats.element})
Dramatic twists:
${dramaDesc}
damage:30-150. NEVER use 融合体. Write passionate dialogue like a shonen anime climax!`
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

    // Parse JSON array from response
    let cleaned = content.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '')
    const match = cleaned.match(/\[[\s\S]*\]/)

    if (!match) {
      return NextResponse.json(
        { error: 'No JSON array found in response' },
        { status: 500 }
      )
    }

    const events: BattleEvent[] = JSON.parse(match[0])

    // Ensure winner is correct in result events
    events.forEach(ev => {
      if (ev.action === 'result') {
        ev.winner = winner
      }
    })

    const result: BattleResponse = { events }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Battle error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
