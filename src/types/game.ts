// Element types
export type Element = 'fire' | 'water' | 'wind' | 'earth' | 'dark' | 'light'

// Character stats
export interface CharacterStats {
  name: string
  hp: number
  attack: number
  defense: number
  speed: number
  element: Element
  rarity: number
  trait?: string
  specialAbility?: string
  weakness?: Element
  resistance?: Element
}

// 3D Model definition types
export interface ModelPosition {
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'torusknot' | 'dodecahedron' | 'icosahedron' | 'octahedron' | 'tetrahedron' | 'ring' | 'plane' | 'group'
  color?: string
  emissive?: string
  emissiveIntensity?: number
  position?: [number, number, number]
  scale?: [number, number, number]
  rotation?: [number, number, number]
  metalness?: number
  roughness?: number
  wireframe?: boolean
  opacity?: number
  doubleSide?: boolean
  part?: string
  children?: ModelPosition[]
  animate?: Record<string, unknown>
  rawScale?: boolean // Use scale values directly as geometry size (for spheres: scale[0] = radius)
}

// Character definition with model and stats
export interface CharacterDefinition {
  model: ModelPosition
  stats: CharacterStats
}

// History item
export interface HistoryItem {
  prompt: string
  modelDef: ModelPosition
  stats: CharacterStats
  timestamp: number
  isFusion?: boolean
  isSuper?: boolean
}

// Boss data
export interface BossData extends CharacterStats {
  model: ModelPosition
}

// Battle outcome
export interface BattleOutcome {
  partyWins: boolean
  partyTotal: number
  bossPower: number
  ratio: number
}

// Battle HP state
export interface PartyMemberHP {
  name: string
  hp: number
  max: number
  alive: boolean
}

export interface BattleHPState {
  bossHp: number
  bossMax: number
  party: PartyMemberHP[]
  fusion: { name: string; hp: number; max: number } | null
}

// Battle event
export interface BattleEvent {
  actor: string
  target?: string
  action: 'attack' | 'special' | 'drama' | 'fusion_arrive' | 'result' | 'event'
  damage?: number
  text: string
  crit?: boolean
  winner?: 'party' | 'boss'
  fusionName?: string
}

// Drama event
export interface DramaEvent {
  id: string
  desc: string
}

// Dice result
export interface DiceResult {
  value: number
  outcome: 'fail' | 'normal' | 'super'
  mult: number
}

// Fusion result
export interface FusionResult {
  obj: unknown // THREE.Object3D
  stats: CharacterStats
  modelDef: ModelPosition
  isSuper?: boolean
  isFailed?: boolean
}

// Game mode
export type GameMode = 'field' | 'battle'

// Battle phase
export type BattlePhase = 'loading' | 'playing' | 'done' | 'lost' | 'error' | null

// Dice phase
export type DicePhase = 'idle' | 'spinning' | 'slowing' | 'landing' | 'done'
