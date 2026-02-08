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
  fire: '🔥炎',
  water: '💧水',
  wind: '🌿風',
  earth: '🪨地',
  dark: '🌙闇',
  light: '✨光'
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
  { id: 'meteor', desc: '巨大隕石が戦場に落下し、衝撃波で両陣営が吹き飛ばされる' },
  { id: 'earthquake', desc: '大地が裂け、溶岩が噴き出す' },
  { id: 'storm', desc: '突然の雷嵐が発生。落雷がボスを直撃' },
  { id: 'eclipse', desc: '日食が起こり闇の力が増幅' },
  { id: 'blizzard', desc: '猛吹雪が戦場を包み視界ゼロに' },
  { id: 'flood', desc: '地下水脈が破裂し戦場が水没し始める' },
  { id: 'ancient_spirit', desc: '古代の戦士の亡霊が現れパーティの一人に憑依して超強化' },
  { id: 'sealed_power', desc: 'パーティメンバーの一人が隠された血統の力に目覚め変身' },
  { id: 'dragon_roar', desc: 'ボスが魂を削る咆哮を放ちパーティ全員の攻撃力が激減' },
  { id: 'boss_evolve', desc: 'ボスが追い詰められ第二形態に進化' },
  { id: 'dimension_crack', desc: '次元の裂け目が開き異世界のエネルギーが流入' },
  { id: 'curse_backfire', desc: 'ボスの呪術が暴走し自分自身を蝕み始める' },
  { id: 'hostage', desc: 'ボスがパーティの一人を人質に取り盾にする' },
  { id: 'trap', desc: '古代のトラップが発動し毒の霧が充満' },
  { id: 'gravity_flip', desc: '重力が反転し全員が宙に浮く' },
  { id: 'mirror_world', desc: '鏡の結界が展開され全員の攻撃が反射される' },
  { id: 'sacrifice', desc: 'パーティメンバーが自分のHPを犠牲にして仲間を全回復' },
  { id: 'weapon_break', desc: 'ボスの攻撃で主力武器が破壊されるが破片が新武器に再構築' },
  { id: 'time_slow', desc: '時間魔法が発動し戦場がスローモーションに' },
  { id: 'slime_rain', desc: '空からスライムの大群が降ってきて大混乱' },
  { id: 'treasure', desc: '戦闘の衝撃で地面から伝説の宝箱が出現' },
  { id: 'phoenix_flame', desc: '不死鳥の炎が噴き上がり倒れかけた味方が復活' },
  { id: 'crystal_prison', desc: '巨大クリスタルがせり上がりボスの片翼を封じ込める' },
  { id: 'blood_moon', desc: '血の月が昇り全員の必殺技ゲージが一気に溜まる' },
  { id: 'soul_link', desc: 'パーティメンバー同士の魂が共鳴しダメージを分散' },
  { id: 'void_zone', desc: '戦場の一部が虚無に飲み込まれ至近距離の殴り合いに' }
]

// Initial characters
export const INITIAL_CHARS: CharacterDefinition[] = [
  {
    stats: {
      name: '炎の剣士',
      hp: 180,
      attack: 85,
      defense: 55,
      speed: 70,
      element: 'fire',
      rarity: 3,
      trait: '誇り高き戦士の魂を持ち、仲間のためなら命を懸ける。炎を纏った拳は鋼をも溶かすほどの熱量を誇る。戦場では常に先陣を切り、その背中が仲間の勇気となる。'
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
      name: '氷の狼',
      hp: 150,
      attack: 70,
      defense: 45,
      speed: 95,
      element: 'water',
      rarity: 3,
      trait: '孤高の一匹狼で、群れを持たず凍土を駆け抜ける。吹雪の中でも獲物を見失わない鋭い嗅覚と、氷の牙で一撃必殺を狙う。心を許した主人には忠実で、その絆は永久凍土より固い。'
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
      name: '蒼天の鷲',
      hp: 140,
      attack: 75,
      defense: 40,
      speed: 100,
      element: 'wind',
      rarity: 3,
      trait: '大空の支配者として雷雲を裂いて飛ぶ姿は蒼い流星のよう。誰よりも自由を愛し、束縛を嫌う気高い性格。その翼が起こす突風は、大地の木々をなぎ倒すほどの力を秘めている。'
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
