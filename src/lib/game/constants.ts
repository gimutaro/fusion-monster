import type { Element, CharacterDefinition, DramaEvent } from '@/types/game'

// Element colors
export const EC: Record<Element, string> = {
  fire: '#ff4444',
  water: '#4488ff',
  wind: '#44ff88',
  earth: '#cc8833',
  dark: '#aa44ff',
  light: '#ffdd44'
}

// Element names with emoji
export const EName: Record<Element, string> = {
  fire: '🔥Fire',
  water: '💧Water',
  wind: '🌿Wind',
  earth: '🪨Earth',
  dark: '🌙Dark',
  light: '✨Light'
}

// Element advantage chart
export const ELEM_ADVANTAGE: Record<Element, Element> = {
  fire: 'wind',
  wind: 'earth',
  earth: 'water',
  water: 'fire',
  light: 'dark',
  dark: 'light'
}

// Dice dots positions
export const DICE_DOTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]
}

// Drama events pool
export const DRAMA_POOL: DramaEvent[] = [
  { id: 'meteor', desc: 'A massive meteor crashes into the battlefield, the shockwave blasting both sides' },
  { id: 'earthquake', desc: 'The earth splits open, lava erupting from the cracks' },
  { id: 'storm', desc: 'A sudden lightning storm appears. A bolt strikes the boss directly' },
  { id: 'eclipse', desc: 'An eclipse occurs, amplifying the power of darkness' },
  { id: 'blizzard', desc: 'A fierce blizzard engulfs the battlefield, reducing visibility to zero' },
  { id: 'flood', desc: 'An underground water vein bursts, flooding the battlefield' },
  { id: 'ancient_spirit', desc: 'The ghost of an ancient warrior appears and possesses a party member, greatly empowering them' },
  { id: 'sealed_power', desc: 'One party member awakens to their hidden bloodline power and transforms' },
  { id: 'dragon_roar', desc: 'The boss unleashes a soul-crushing roar, drastically reducing the entire party\'s attack power' },
  { id: 'boss_evolve', desc: 'Cornered, the boss evolves into its second form' },
  { id: 'dimension_crack', desc: 'A dimensional rift opens, otherworldly energy pouring through' },
  { id: 'curse_backfire', desc: 'The boss\'s curse magic goes haywire, beginning to consume itself' },
  { id: 'hostage', desc: 'The boss takes a party member hostage, using them as a shield' },
  { id: 'trap', desc: 'An ancient trap activates, filling the area with poisonous mist' },
  { id: 'gravity_flip', desc: 'Gravity reverses, everyone floats into the air' },
  { id: 'mirror_world', desc: 'A mirror barrier unfolds, reflecting everyone\'s attacks' },
  { id: 'sacrifice', desc: 'A party member sacrifices their own HP to fully heal their allies' },
  { id: 'weapon_break', desc: 'The boss\'s attack destroys the main weapon, but the fragments reform into a new weapon' },
  { id: 'time_slow', desc: 'Time magic activates, the battlefield moving in slow motion' },
  { id: 'slime_rain', desc: 'A horde of slimes rains from the sky, causing chaos' },
  { id: 'treasure', desc: 'The battle\'s impact unearths a legendary treasure chest' },
  { id: 'phoenix_flame', desc: 'Phoenix flames erupt, reviving a fallen ally' },
  { id: 'crystal_prison', desc: 'A massive crystal rises, sealing one of the boss\'s wings' },
  { id: 'blood_moon', desc: 'A blood moon rises, instantly charging everyone\'s special attack gauge' },
  { id: 'soul_link', desc: 'The party members\' souls resonate, sharing damage among them' },
  { id: 'void_zone', desc: 'Part of the battlefield is swallowed by the void, forcing close-quarters combat' }
]

// Initial characters
export const INITIAL_CHARS: CharacterDefinition[] = [
  {
    stats: {
      name: 'Flame Swordsman',
      hp: 180,
      attack: 85,
      defense: 55,
      speed: 70,
      element: 'fire',
      rarity: 3,
      trait: 'A warrior with a proud soul who would risk their life for their comrades. Their flame-clad fists boast enough heat to melt steel. Always leading the charge, their back inspires courage in allies.'
    },
    model: {
      type: 'group',
      position: [0, 2, 0],
      children: [
        { type: 'box', color: '#8b1a1a', position: [0, 0, 0], scale: [0.85, 1.35, 0.45], metalness: 0.4, roughness: 0.3 },
        { type: 'box', color: '#cc3333', position: [0, 0.15, 0.05], scale: [0.75, 0.9, 0.35] },
        { type: 'box', color: '#ff6600', position: [0, -0.5, 0], scale: [0.88, 0.25, 0.48], metalness: 0.6 },
        { type: 'sphere', color: '#ffe0bd', position: [0, 1.0, 0], scale: [0.55, 0.62, 0.5], part: 'head' },
        { type: 'sphere', color: '#ffffff', position: [-0.13, 1.05, 0.22], scale: [0.13, 0.13, 0.06] },
        { type: 'sphere', color: '#ffffff', position: [0.13, 1.05, 0.22], scale: [0.13, 0.13, 0.06] },
        { type: 'sphere', color: '#331100', position: [-0.13, 1.05, 0.26], scale: [0.07, 0.08, 0.04] },
        { type: 'sphere', color: '#331100', position: [0.13, 1.05, 0.26], scale: [0.07, 0.08, 0.04] },
        { type: 'box', color: '#3d1a0a', position: [-0.15, 1.18, 0.12], scale: [0.13, 0.035, 0.08], rotation: [0, 0, 0.15] },
        { type: 'box', color: '#3d1a0a', position: [0.15, 1.18, 0.12], scale: [0.13, 0.035, 0.08], rotation: [0, 0, -0.15] },
        { type: 'box', color: '#ffe0bd', position: [0, 0.88, 0.24], scale: [0.15, 0.06, 0.06] },
        { type: 'box', color: '#cc4444', position: [0, 0.82, 0.22], scale: [0.2, 0.04, 0.05] },
        { type: 'sphere', color: '#aa2200', position: [0, 1.35, 0], scale: [0.52, 0.3, 0.45] },
        { type: 'cone', color: '#ff4400', position: [0, 1.55, 0], scale: [0.35, 0.3, 0.35] },
        { type: 'box', color: '#ff4400', emissive: '#ff2200', position: [-0.08, 1.7, 0], scale: [0.06, 0.2, 0.04] },
        { type: 'box', color: '#ffaa00', emissive: '#ff4400', position: [0.05, 1.75, 0], scale: [0.04, 0.15, 0.03] },
        { type: 'cylinder', color: '#ffe0bd', position: [-0.55, 0.15, 0], scale: [0.13, 0.95, 0.13], rotation: [0, 0, -0.2], part: 'arm_l' },
        { type: 'cylinder', color: '#ffe0bd', position: [0.55, 0.15, 0], scale: [0.13, 0.95, 0.13], rotation: [0, 0, 0.2], part: 'arm_r' },
        { type: 'cylinder', color: '#4a2a1a', position: [-0.2, -1.2, 0], scale: [0.16, 1.05, 0.16], part: 'leg_fl' },
        { type: 'cylinder', color: '#4a2a1a', position: [0.2, -1.2, 0], scale: [0.16, 1.05, 0.16], part: 'leg_fr' },
        { type: 'box', color: '#333333', position: [-0.2, -1.75, 0.05], scale: [0.2, 0.12, 0.28], metalness: 0.5 },
        { type: 'box', color: '#333333', position: [0.2, -1.75, 0.05], scale: [0.2, 0.12, 0.28], metalness: 0.5 }
      ]
    }
  },
  {
    stats: {
      name: 'Ice Wolf',
      hp: 150,
      attack: 70,
      defense: 45,
      speed: 95,
      element: 'water',
      rarity: 3,
      trait: 'A proud lone wolf, running through frozen lands without a pack. With keen senses that never lose prey even in blizzards, they aim for one-hit kills with their icy fangs. Fiercely loyal to those they trust, their bond is harder than permafrost.'
    },
    model: {
      type: 'group',
      position: [0, 1.3, 0],
      children: [
        { type: 'cylinder', color: '#b0c4de', position: [0, 0, 0], scale: [0.7, 1.5, 0.7], rotation: [1.57, 0, 0] },
        { type: 'sphere', color: '#d8e8ff', position: [0, 0.3, 0.9], scale: [0.55, 0.5, 0.5], part: 'head' },
        { type: 'sphere', color: '#ffffff', position: [-0.15, 0.4, 1.15], scale: [0.12, 0.14, 0.08] },
        { type: 'sphere', color: '#ffffff', position: [0.15, 0.4, 1.15], scale: [0.12, 0.14, 0.08] },
        { type: 'sphere', color: '#1a4a7a', position: [-0.15, 0.4, 1.2], scale: [0.07, 0.09, 0.05] },
        { type: 'sphere', color: '#1a4a7a', position: [0.15, 0.4, 1.2], scale: [0.07, 0.09, 0.05] },
        { type: 'sphere', color: '#88ccff', emissive: '#4488ff', position: [-0.15, 0.42, 1.22], scale: [0.03, 0.03, 0.02] },
        { type: 'sphere', color: '#88ccff', emissive: '#4488ff', position: [0.15, 0.42, 1.22], scale: [0.03, 0.03, 0.02] },
        { type: 'cone', color: '#e0ecff', position: [-0.2, 0.6, 0.85], scale: [0.12, 0.25, 0.06], rotation: [0.2, 0, 0.3] },
        { type: 'cone', color: '#e0ecff', position: [0.2, 0.6, 0.85], scale: [0.12, 0.25, 0.06], rotation: [0.2, 0, -0.3] },
        { type: 'cylinder', color: '#a0b8d8', position: [-0.3, -0.5, 0.45], scale: [0.12, 0.7, 0.12], part: 'leg_fl' },
        { type: 'cylinder', color: '#a0b8d8', position: [0.3, -0.5, 0.45], scale: [0.12, 0.7, 0.12], part: 'leg_fr' },
        { type: 'cylinder', color: '#a0b8d8', position: [-0.3, -0.5, -0.45], scale: [0.12, 0.7, 0.12], part: 'leg_bl' },
        { type: 'cylinder', color: '#a0b8d8', position: [0.3, -0.5, -0.45], scale: [0.12, 0.7, 0.12], part: 'leg_br' },
        { type: 'sphere', color: '#e0ecff', position: [-0.3, -0.88, 0.45], scale: [0.14, 0.06, 0.18] },
        { type: 'sphere', color: '#e0ecff', position: [0.3, -0.88, 0.45], scale: [0.14, 0.06, 0.18] },
        { type: 'sphere', color: '#e0ecff', position: [-0.3, -0.88, -0.45], scale: [0.14, 0.06, 0.18] },
        { type: 'sphere', color: '#e0ecff', position: [0.3, -0.88, -0.45], scale: [0.14, 0.06, 0.18] },
        { type: 'cylinder', color: '#c0d8f0', position: [0, -0.05, -0.95], scale: [0.1, 0.7, 0.08], rotation: [0.8, 0, 0], part: 'tail' }
      ]
    }
  },
  {
    stats: {
      name: 'Azure Eagle',
      hp: 140,
      attack: 75,
      defense: 40,
      speed: 100,
      element: 'wind',
      rarity: 3,
      trait: 'Master of the skies, soaring through thunderclouds like a blue comet. A noble spirit who loves freedom above all and despises restraint. Their wings generate gusts powerful enough to flatten forests.'
    },
    model: {
      type: 'group',
      position: [0, 2.0, 0],
      children: [
        { type: 'cylinder', color: '#2a5a8a', position: [0, 0, 0], scale: [0.7, 1.2, 0.65], rotation: [1.3, 0, 0] },
        { type: 'sphere', color: '#3a6a9a', position: [0, 0.1, 0], scale: [0.6, 0.5, 0.55] },
        { type: 'sphere', color: '#4a7aaa', position: [0, 0.3, 0.7], scale: [0.45, 0.42, 0.42], part: 'head' },
        { type: 'cone', color: '#ffaa22', position: [0, 0.22, 0.98], scale: [0.12, 0.3, 0.1], rotation: [-1.3, 0, 0], metalness: 0.6 },
        { type: 'sphere', color: '#ffffff', position: [-0.12, 0.36, 0.9], scale: [0.1, 0.12, 0.07] },
        { type: 'sphere', color: '#ffffff', position: [0.12, 0.36, 0.9], scale: [0.1, 0.12, 0.07] },
        { type: 'sphere', color: '#1a1a1a', position: [-0.12, 0.37, 0.94], scale: [0.06, 0.07, 0.04] },
        { type: 'sphere', color: '#1a1a1a', position: [0.12, 0.37, 0.94], scale: [0.06, 0.07, 0.04] },
        { type: 'sphere', color: '#44ddff', emissive: '#22aaff', position: [-0.12, 0.38, 0.95], scale: [0.025, 0.025, 0.02] },
        { type: 'sphere', color: '#44ddff', emissive: '#22aaff', position: [0.12, 0.38, 0.95], scale: [0.025, 0.025, 0.02] },
        { type: 'cone', color: '#1a3a5a', position: [-0.1, 0.52, 0.6], scale: [0.08, 0.2, 0.05], rotation: [0.2, 0, 0.3] },
        { type: 'cone', color: '#1a3a5a', position: [0.1, 0.52, 0.6], scale: [0.08, 0.2, 0.05], rotation: [0.2, 0, -0.3] },
        { type: 'sphere', color: '#2a5a8a', position: [0, 0.15, 0.55], scale: [0.35, 0.25, 0.25] },
        {
          type: 'group',
          position: [-0.4, 0.3, 0],
          part: 'wing_l',
          children: [
            { type: 'box', color: '#2a5a8a', position: [-0.6, 0, 0], scale: [1.3, 0.06, 0.7] },
            { type: 'box', color: '#1a4a7a', position: [-1.1, 0.02, 0], scale: [0.7, 0.04, 0.5] },
            { type: 'box', color: '#3a7aaa', emissive: '#22aaff', position: [-0.5, -0.02, 0.2], scale: [0.8, 0.03, 0.25], opacity: 0.7 }
          ]
        },
        {
          type: 'group',
          position: [0.4, 0.3, 0],
          part: 'wing_r',
          children: [
            { type: 'box', color: '#2a5a8a', position: [0.6, 0, 0], scale: [1.3, 0.06, 0.7] },
            { type: 'box', color: '#1a4a7a', position: [1.1, 0.02, 0], scale: [0.7, 0.04, 0.5] },
            { type: 'box', color: '#3a7aaa', emissive: '#22aaff', position: [0.5, -0.02, 0.2], scale: [0.8, 0.03, 0.25], opacity: 0.7 }
          ]
        },
        { type: 'cylinder', color: '#2a5a8a', position: [-0.15, -0.55, 0.3], scale: [0.08, 0.5, 0.08], part: 'leg_fl' },
        { type: 'cylinder', color: '#2a5a8a', position: [0.15, -0.55, 0.3], scale: [0.08, 0.5, 0.08], part: 'leg_fr' },
        { type: 'box', color: '#ffaa22', position: [-0.15, -0.83, 0.35], scale: [0.12, 0.04, 0.18], metalness: 0.5 },
        { type: 'box', color: '#ffaa22', position: [0.15, -0.83, 0.35], scale: [0.12, 0.04, 0.18], metalness: 0.5 },
        { type: 'cylinder', color: '#1a4a7a', position: [0, -0.05, -0.7], scale: [0.08, 0.6, 0.06], rotation: [0.8, 0, 0], part: 'tail' },
        { type: 'box', color: '#3a7aaa', emissive: '#22aaff', position: [0, 0.0, -1.05], scale: [0.35, 0.04, 0.25], opacity: 0.8 },
        { type: 'box', color: '#2a5a8a', position: [0, 0.05, -1.0], scale: [0.25, 0.03, 0.2] }
      ]
    }
  }
]
