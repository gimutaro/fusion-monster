import type { CharacterStats, BattleOutcome, DramaEvent } from '@/types/game'
import { ELEM_ADVANTAGE, DRAMA_POOL } from './constants'

/**
 * Calculate battle outcome based on party, fusion, and boss stats
 */
export function calcBattleOutcome(
  party: CharacterStats[],
  fusion: CharacterStats,
  boss: CharacterStats
): BattleOutcome {
  const powerScore = (s: CharacterStats): number => {
    return (s.hp || 0) + (s.attack || 0) * 2.5 + (s.defense || 0) * 1.5 + (s.speed || 0) * 1.2
  }

  let partyTotal = party.reduce((acc, s) => acc + powerScore(s), 0) + powerScore(fusion)

  // Element bonuses
  const allElements = [...party.map(s => s.element), fusion.element]
  let elementBonus = 0

  allElements.forEach(element => {
    if (element === boss.weakness) {
      elementBonus += 80
    }
    if (element === boss.resistance) {
      elementBonus -= 40
    }
    if (ELEM_ADVANTAGE[element] === boss.element) {
      elementBonus += 30
    }
  })

  partyTotal += elementBonus

  // Rarity bonus
  const avgRarity = [...party, fusion].reduce((sum, m) => sum + (m.rarity || 1), 0) / [...party, fusion].length
  partyTotal += avgRarity * 20

  // Boss power (with multiplier for difficulty)
  const bossPower = powerScore(boss) * 1.3

  const ratio = partyTotal / bossPower

  return {
    partyWins: ratio >= 0.85,
    partyTotal: Math.round(partyTotal),
    bossPower: Math.round(bossPower),
    ratio: Math.round(ratio * 100)
  }
}

/**
 * Pick random drama events from the pool
 */
export function pickDramaEvents(count: number = 2): DramaEvent[] {
  const pool = [...DRAMA_POOL]
  const result: DramaEvent[] = []

  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(index, 1)[0])
  }

  return result
}
