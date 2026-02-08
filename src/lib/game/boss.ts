import type { BossData, ModelPosition } from '@/types/game'

// Horror creature base boss model - exact reproduction from boss.html
const BASE_BOSS: BossData = {
  name: 'Nightmare Beast',
  element: 'dark',
  hp: 500,
  attack: 85,
  defense: 60,
  speed: 35,
  rarity: 4,
  specialAbility: 'Gaze of Terror',
  weakness: 'light',
  resistance: 'dark',
  model: {
    type: 'group',
    position: [0, 0, 0],
    children: [
      // Body - SphereGeometry(1.5) at origin, color 0x8b7355
      { type: 'sphere', color: '#8b7355', position: [0, 0, 0], scale: [1.5, 1.5, 1.5], rawScale: true },

      // Head - SphereGeometry(1), y=2, scale(1.2, 1.3, 1), color 0xa08070
      { type: 'sphere', color: '#a08070', position: [0, 2, 0], scale: [1.2, 1.3, 1.0], part: 'head', rawScale: true },

      // Left Ear - ConeGeometry(0.3, 2), position(-0.7, 3.5, 0.2), rotation.z=-0.3
      { type: 'cone', color: '#7a6050', position: [-0.7, 3.5, 0.2], scale: [0.3, 2.0, 0.3], rotation: [0, 0, -0.3] },

      // Right Ear - ConeGeometry(0.3, 2), position(0.7, 3.3, 0.2), rotation.z=0.3, scale.y=1.3
      { type: 'cone', color: '#7a6050', position: [0.7, 3.3, 0.2], scale: [0.3, 2.6, 0.3], rotation: [0, 0, 0.3] },

      // Eye 1 (Left main) - eyeGroup.y=2, eye at (-0.5, 0.3, 0.9), scale 1
      // White: radius 0.25
      { type: 'sphere', color: '#ffffee', emissive: '#222200', position: [-0.5, 2.3, 0.9], scale: [0.25, 0.25, 0.25], rawScale: true },
      // Pupil: radius 0.15, z += 0.2
      { type: 'sphere', color: '#000000', emissive: '#ff0000', position: [-0.5, 2.3, 1.1], scale: [0.15, 0.15, 0.15], rawScale: true },

      // Eye 2 (Right main) - at (0.5, 0.3, 0.9), scale 1
      { type: 'sphere', color: '#ffffee', emissive: '#222200', position: [0.5, 2.3, 0.9], scale: [0.25, 0.25, 0.25], rawScale: true },
      { type: 'sphere', color: '#000000', emissive: '#ff0000', position: [0.5, 2.3, 1.1], scale: [0.15, 0.15, 0.15], rawScale: true },

      // Eye 3 (Center top) - at (0, 0.6, 0.8), scale 0.6
      // White: radius 0.25*0.6=0.15
      { type: 'sphere', color: '#ffffee', emissive: '#222200', position: [0, 2.6, 0.8], scale: [0.15, 0.15, 0.15], rawScale: true },
      // Pupil: radius 0.15*0.6=0.09, z += 0.2*0.6=0.12
      { type: 'sphere', color: '#000000', emissive: '#ff0000', position: [0, 2.6, 0.92], scale: [0.09, 0.09, 0.09], rawScale: true },

      // Eye 4 (Lower left small) - at (-0.3, -0.2, 0.95), scale 0.4
      // White: radius 0.25*0.4=0.1
      { type: 'sphere', color: '#ffffee', emissive: '#222200', position: [-0.3, 1.8, 0.95], scale: [0.1, 0.1, 0.1], rawScale: true },
      // Pupil: radius 0.15*0.4=0.06, z += 0.2*0.4=0.08
      { type: 'sphere', color: '#000000', emissive: '#ff0000', position: [-0.3, 1.8, 1.03], scale: [0.06, 0.06, 0.06], rawScale: true },

      // Tentacle 1 - angle=0, x=1.3, z=0, y=-0.5, rotation.z=0
      {
        type: 'group',
        position: [1.3, -0.5, 0],
        rotation: [0, 0, 0],
        part: 'arm_r',
        children: [
          // segment 0: size=0.15, y=0, x=0
          { type: 'sphere', color: '#6b5b4b', position: [0, 0, 0], scale: [0.15, 0.15, 0.15], rawScale: true },
          // segment 1: size=0.13, y=-0.3, x=sin(0.5)*0.2≈0.096
          { type: 'sphere', color: '#6b5b4b', position: [0.096, -0.3, 0], scale: [0.13, 0.13, 0.13], rawScale: true },
          // segment 2: size=0.11, y=-0.6, x=sin(1.0)*0.2≈0.168
          { type: 'sphere', color: '#6b5b4b', position: [0.168, -0.6, 0], scale: [0.11, 0.11, 0.11], rawScale: true },
          // segment 3: size=0.09, y=-0.9, x=sin(1.5)*0.2≈0.2
          { type: 'sphere', color: '#6b5b4b', position: [0.2, -0.9, 0], scale: [0.09, 0.09, 0.09], rawScale: true },
          // segment 4: size=0.07, y=-1.2, x=sin(2.0)*0.2≈0.182
          { type: 'sphere', color: '#6b5b4b', position: [0.182, -1.2, 0], scale: [0.07, 0.07, 0.07], rawScale: true }
        ]
      },

      // Tentacle 2 - angle=π/2, x=0, z=1.3, y=-0.5, rotation.z=π/2≈1.57
      {
        type: 'group',
        position: [0, -0.5, 1.3],
        rotation: [0, 0, 1.57],
        part: 'leg_fr',
        children: [
          { type: 'sphere', color: '#6b5b4b', position: [0, 0, 0], scale: [0.15, 0.15, 0.15], rawScale: true },
          { type: 'sphere', color: '#6b5b4b', position: [0.096, -0.3, 0], scale: [0.13, 0.13, 0.13], rawScale: true },
          { type: 'sphere', color: '#6b5b4b', position: [0.168, -0.6, 0], scale: [0.11, 0.11, 0.11], rawScale: true },
          { type: 'sphere', color: '#6b5b4b', position: [0.2, -0.9, 0], scale: [0.09, 0.09, 0.09], rawScale: true },
          { type: 'sphere', color: '#6b5b4b', position: [0.182, -1.2, 0], scale: [0.07, 0.07, 0.07], rawScale: true }
        ]
      },

      // Tentacle 3 - angle=π, x=-1.3, z=0, y=-0.5, rotation.z=π≈3.14
      {
        type: 'group',
        position: [-1.3, -0.5, 0],
        rotation: [0, 0, 3.14],
        part: 'arm_l',
        children: [
          { type: 'sphere', color: '#6b5b4b', position: [0, 0, 0], scale: [0.15, 0.15, 0.15], rawScale: true },
          { type: 'sphere', color: '#6b5b4b', position: [0.096, -0.3, 0], scale: [0.13, 0.13, 0.13], rawScale: true },
          { type: 'sphere', color: '#6b5b4b', position: [0.168, -0.6, 0], scale: [0.11, 0.11, 0.11], rawScale: true },
          { type: 'sphere', color: '#6b5b4b', position: [0.2, -0.9, 0], scale: [0.09, 0.09, 0.09], rawScale: true },
          { type: 'sphere', color: '#6b5b4b', position: [0.182, -1.2, 0], scale: [0.07, 0.07, 0.07], rawScale: true }
        ]
      },

      // Tentacle 4 - angle=3π/2, x=0, z=-1.3, y=-0.5, rotation.z=3π/2≈4.71
      {
        type: 'group',
        position: [0, -0.5, -1.3],
        rotation: [0, 0, 4.71],
        part: 'leg_bl',
        children: [
          { type: 'sphere', color: '#6b5b4b', position: [0, 0, 0], scale: [0.15, 0.15, 0.15], rawScale: true },
          { type: 'sphere', color: '#6b5b4b', position: [0.096, -0.3, 0], scale: [0.13, 0.13, 0.13], rawScale: true },
          { type: 'sphere', color: '#6b5b4b', position: [0.168, -0.6, 0], scale: [0.11, 0.11, 0.11], rawScale: true },
          { type: 'sphere', color: '#6b5b4b', position: [0.2, -0.9, 0], scale: [0.09, 0.09, 0.09], rawScale: true },
          { type: 'sphere', color: '#6b5b4b', position: [0.182, -1.2, 0], scale: [0.07, 0.07, 0.07], rawScale: true }
        ]
      }
    ]
  }
}

// Boss names by stage
const BOSS_NAMES = [
  'Nightmare Beast',
  'Blood Fiend',
  'Frost Horror',
  'Venom Creeper',
  'Thunder Demon',
  'Shadow Wraith',
  'Inferno Beast',
  'Abyss Watcher',
  'Chaos Horror',
  'Eternal Nightmare'
]

// Color palettes for each stage: [body, head, ear, tentacle]
const BOSS_COLORS: Record<number, { body: string; head: string; ear: string; tentacle: string }> = {
  // Stage 1: Original brown/tan (matching boss.html)
  0: { body: '#8b7355', head: '#a08070', ear: '#7a6050', tentacle: '#6b5b4b' },
  // Stage 2: Blood red
  1: { body: '#8b3535', head: '#a05050', ear: '#7a3030', tentacle: '#6b2b2b' },
  // Stage 3: Frost blue
  2: { body: '#556b8b', head: '#7080a0', ear: '#506080', tentacle: '#4b5b7b' },
  // Stage 4: Toxic green
  3: { body: '#4b8b45', head: '#60a058', ear: '#507a48', tentacle: '#406b3b' },
  // Stage 5: Storm purple
  4: { body: '#7b558b', head: '#9070a0', ear: '#7a5080', tentacle: '#6b4b7b' },
  // Stage 6: Shadow gray
  5: { body: '#5b5b6b', head: '#707080', ear: '#606070', tentacle: '#505060' },
  // Stage 7: Inferno orange
  6: { body: '#8b5535', head: '#a07050', ear: '#8a5030', tentacle: '#7b4525' },
  // Stage 8: Abyss dark blue
  7: { body: '#35458b', head: '#5060a0', ear: '#304080', tentacle: '#2b3b6b' },
  // Stage 9: Chaos magenta
  8: { body: '#8b3570', head: '#a05088', ear: '#7a3068', tentacle: '#6b2b58' },
  // Stage 10: Eternal void (almost black)
  9: { body: '#3a3545', head: '#4a4555', ear: '#3a3545', tentacle: '#2a2535' }
}

// Eye glow colors by stage
const BOSS_EYE_COLORS = [
  '#ff0000', // Red
  '#ff2200', // Blood red
  '#00ccff', // Ice blue
  '#44ff00', // Toxic green
  '#aa00ff', // Electric purple
  '#666666', // Ghostly gray
  '#ff6600', // Fire orange
  '#0044ff', // Deep blue
  '#ff00aa', // Chaos pink
  '#ffffff'  // Void white
]

/**
 * Recursively recolor a model node
 */
function recolorNode(
  node: ModelPosition,
  colors: { body: string; head: string; ear: string; tentacle: string },
  eyeColor: string
): void {
  // Body color
  if (node.color === '#8b7355') node.color = colors.body
  // Head color
  else if (node.color === '#a08070') node.color = colors.head
  // Ear color
  else if (node.color === '#7a6050') node.color = colors.ear
  // Tentacle color
  else if (node.color === '#6b5b4b') node.color = colors.tentacle

  // Eye glow - update emissive for pupils (black spheres with red emissive)
  if (node.color === '#000000' && node.emissive === '#ff0000') {
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
  const multiplier = Math.pow(1.8, stage - 1)
  const index = (stage - 1) % BOSS_NAMES.length
  const colors = BOSS_COLORS[index]
  const eyeColor = BOSS_EYE_COLORS[index]

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
