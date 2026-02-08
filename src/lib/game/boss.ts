import type { BossData, ModelPosition } from '@/types/game'

// Base boss model
const BASE_BOSS: BossData = {
  name: 'ダークドラゴン',
  element: 'dark',
  hp: 500,
  attack: 85,
  defense: 60,
  speed: 35,
  rarity: 4,
  specialAbility: '暗黒のブレス',
  weakness: 'light',
  resistance: 'dark',
  model: {
    type: 'group',
    position: [0, 2.2, 0],
    children: [
      { type: 'cylinder', color: '#2a1a3e', position: [0, 0, 0], scale: [0.9, 1.8, 0.9], rotation: [1.57, 0, 0] },
      { type: 'sphere', color: '#3a2a4e', position: [0, 0.1, 0], scale: [0.75, 0.6, 0.65] },
      { type: 'sphere', color: '#2a1a3e', position: [0, 0.4, 1.1], scale: [0.55, 0.5, 0.55], part: 'head' },
      { type: 'cone', color: '#1a0a2e', position: [-0.2, 0.7, 1.0], scale: [0.1, 0.35, 0.08], rotation: [0.3, 0, 0.3] },
      { type: 'cone', color: '#1a0a2e', position: [0.2, 0.7, 1.0], scale: [0.1, 0.35, 0.08], rotation: [0.3, 0, -0.3] },
      { type: 'sphere', color: '#ff0000', emissive: '#ff0000', position: [-0.15, 0.5, 1.35], scale: [0.08, 0.1, 0.06] },
      { type: 'sphere', color: '#ff0000', emissive: '#ff0000', position: [0.15, 0.5, 1.35], scale: [0.08, 0.1, 0.06] },
      { type: 'cone', color: '#3a2a4e', position: [0, 0.3, 1.5], scale: [0.12, 0.25, 0.08], rotation: [-1.2, 0, 0] },
      {
        type: 'group',
        position: [-0.5, 0.5, 0],
        part: 'wing_l',
        children: [
          { type: 'box', color: '#3a1a5e', position: [-0.7, 0, 0], scale: [1.5, 0.06, 0.8] },
          { type: 'box', color: '#2a0a4e', position: [-1.2, 0.1, 0], scale: [0.8, 0.04, 0.5] }
        ]
      },
      {
        type: 'group',
        position: [0.5, 0.5, 0],
        part: 'wing_r',
        children: [
          { type: 'box', color: '#3a1a5e', position: [0.7, 0, 0], scale: [1.5, 0.06, 0.8] },
          { type: 'box', color: '#2a0a4e', position: [1.2, 0.1, 0], scale: [0.8, 0.04, 0.5] }
        ]
      },
      { type: 'cylinder', color: '#2a1a3e', position: [-0.4, -0.55, 0.5], scale: [0.16, 0.7, 0.16], part: 'leg_fl' },
      { type: 'cylinder', color: '#2a1a3e', position: [0.4, -0.55, 0.5], scale: [0.16, 0.7, 0.16], part: 'leg_fr' },
      { type: 'cylinder', color: '#2a1a3e', position: [-0.4, -0.55, -0.5], scale: [0.16, 0.7, 0.16], part: 'leg_bl' },
      { type: 'cylinder', color: '#2a1a3e', position: [0.4, -0.55, -0.5], scale: [0.16, 0.7, 0.16], part: 'leg_br' },
      { type: 'cylinder', color: '#1a0a2e', position: [0, 0.1, -1.2], scale: [0.1, 0.8, 0.1], rotation: [1.2, 0, 0], part: 'tail' }
    ]
  }
}

// Boss names by stage
const BOSS_NAMES = [
  'ダークドラゴン',
  'カオスワイバーン',
  'アビスドレイク',
  'ヴォイドサーペント',
  'ネクロバハムート',
  'シャドウリヴァイアサン',
  'デスフェニックス',
  'ブラッドティアマト',
  'インフェルノヒドラ',
  'エターナルドラゴン'
]

// Boss color palettes by stage
const BOSS_COLORS = [
  ['#2a1a3e', '#3a2a4e', '#1a0a2e', '#3a1a5e', '#2a0a4e'],
  ['#3e1a1a', '#4e2a2a', '#2e0a0a', '#5e1a1a', '#4e0a0a'],
  ['#1a2a3e', '#2a3a4e', '#0a1a2e', '#1a3a5e', '#0a2a4e'],
  ['#1a3e1a', '#2a4e2a', '#0a2e0a', '#1a5e1a', '#0a4e0a'],
  ['#3e3e1a', '#4e4e2a', '#2e2e0a', '#5e5e1a', '#4e4e0a'],
  ['#3e1a2a', '#4e2a3a', '#2e0a1a', '#5e1a2a', '#4e0a1a'],
  ['#2a3e1a', '#3a4e2a', '#1a2e0a', '#2a5e1a', '#1a4e0a'],
  ['#1a1a3e', '#2a2a4e', '#0a0a2e', '#1a1a5e', '#0a0a4e'],
  ['#3e2a1a', '#4e3a2a', '#2e1a0a', '#5e2a1a', '#4e1a0a'],
  ['#2a1a2a', '#3a2a3a', '#1a0a1a', '#3a1a3a', '#2a0a2a']
]

// Boss eye colors by stage
const BOSS_EYES = [
  '#ff0000',
  '#ff4400',
  '#00ffff',
  '#44ff00',
  '#ffff00',
  '#ff00ff',
  '#ff8800',
  '#0088ff',
  '#ff2200',
  '#ffffff'
]

/**
 * Recursively recolor a model node
 */
function recolorNode(node: ModelPosition, colors: string[], eyeColor: string): void {
  if (node.color === '#2a1a3e') node.color = colors[0]
  else if (node.color === '#3a2a4e') node.color = colors[1]
  else if (node.color === '#1a0a2e') node.color = colors[2]
  else if (node.color === '#3a1a5e') node.color = colors[3]
  else if (node.color === '#2a0a4e') node.color = colors[4]

  if (node.color === '#ff0000' && node.emissive === '#ff0000') {
    node.color = eyeColor
    node.emissive = eyeColor
  }

  if (node.children) {
    node.children.forEach(child => recolorNode(child, colors, eyeColor))
  }
}

/**
 * Get scaled boss for a given stage
 */
export function getScaledBoss(stage: number): BossData {
  const multiplier = Math.pow(2, stage - 1)
  const index = (stage - 1) % BOSS_NAMES.length
  const colors = BOSS_COLORS[index]
  const eyeColor = BOSS_EYES[index]

  // Deep clone the model
  const model = JSON.parse(JSON.stringify(BASE_BOSS.model)) as ModelPosition

  // Recolor the model
  recolorNode(model, colors, eyeColor)

  return {
    ...BASE_BOSS,
    name: BOSS_NAMES[index],
    hp: Math.round(BASE_BOSS.hp * multiplier),
    attack: Math.round(BASE_BOSS.attack * multiplier),
    defense: Math.round(BASE_BOSS.defense * multiplier),
    speed: Math.round(BASE_BOSS.speed * multiplier),
    rarity: Math.min(5, BASE_BOSS.rarity + Math.floor((stage - 1) / 2)),
    model
  }
}
