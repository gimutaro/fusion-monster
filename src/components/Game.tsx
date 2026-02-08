'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { IntroModal } from './IntroModal'
import { StageClearModal } from './StageClearModal'
import { DiceModal } from './DiceModal'
import { CharacterBook } from './CharacterBook'
import { SettingsModal } from './SettingsModal'
import { buildObj, adjustGround, removeFloatingParts } from '@/lib/three/builder'
import { calcBattleOutcome } from '@/lib/game/battle'
import { getScaledBoss } from '@/lib/game/boss'
import { EC, EName, INITIAL_CHARS } from '@/lib/game/constants'
import { audioManager } from '@/lib/audio/audioManager'
import type {
  HistoryItem,
  CharacterStats,
  ModelPosition,
  BattleHPState,
  DiceResult,
  DicePhase,
  GameMode,
  BattlePhase,
  FusionResult,
  Element
} from '@/types/game'

interface SparkParticle {
  id: number
  x: number
  y: number
  size: number
  color: string
}

export default function Game() {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const camRef = useRef<THREE.PerspectiveCamera | null>(null)
  const renRef = useRef<THREE.WebGLRenderer | null>(null)
  const genRef = useRef<THREE.Object3D[]>([])
  const rc = useRef(new THREE.Raycaster())
  const ms = useRef(new THREE.Vector2())
  const bossRef = useRef<THREE.Object3D | null>(null)
  const partyBRef = useRef<THREE.Object3D[]>([])
  const fusionBRef = useRef<THREE.Object3D | null>(null)
  const animRef = useRef<{
    active: boolean
    phase: string
    progress: number
    attacker: THREE.Object3D
    target: THREE.Object3D | null
    homePos: THREE.Vector3
    hitPos: THREE.Vector3
    targetHome: THREE.Vector3
    effectSpawned: boolean
    element: string
    knockStarted: boolean
    knockDir: THREE.Vector3 | null
    knockDist: number
    knockReturnStart?: THREE.Vector3
    onComplete?: () => void
  } | null>(null)
  const savedRef = useRef<{ pos: THREE.Vector3; rot: THREE.Euler; vis: boolean }[]>([])
  const savedCamRef = useRef<{ pos: THREE.Vector3 } | null>(null)
  const modeR = useRef<GameMode>('field')
  const stepR = useRef(0)
  const fpR = useRef<number[]>([])
  const ppR = useRef<number[]>([])
  const fusionResRef = useRef<FusionResult | null>(null)
  const arrowsRef = useRef<THREE.Mesh[]>([])
  const initDoneRef = useRef(false)
  const stageR = useRef(1)
  const curBossRef = useRef<CharacterStats | null>(null)
  const superMultRef = useRef(1)
  const pendingCharsRef = useRef<{ obj: THREE.Object3D; modelDef: ModelPosition; stats: CharacterStats; prompt: string }[]>([])
  const effectsRef = useRef<THREE.Object3D[]>([])
  const spawnFxRef = useRef<((position: THREE.Vector3, element: string) => void) | null>(null)
  const defeatAnimRef = useRef<{ obj: THREE.Object3D; progress: number; startRotZ: number; startRotX: number; startY: number; targetRotZ: number; done: boolean }[]>([])
  const victoryAnimRef = useRef<{ obj: THREE.Object3D; progress: number; baseY: number; delay: number; started: boolean; done: boolean }[]>([])
  const logEndRef = useRef<HTMLDivElement>(null)

  // State
  const [prompt, setPrompt] = useState('')
  const [isGen, setIsGen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [fp, setFp] = useState<number[]>([])
  const [pp, setPp] = useState<number[]>([])
  const [fusionSt, setFusionSt] = useState<string | null>(null)
  const [mode, setMode] = useState<GameMode>('field')
  const [bPhase, setBPhase] = useState<BattlePhase>(null)
  const [bLog, setBLog] = useState<string[]>([])
  const [bHP, setBHP] = useState<BattleHPState | null>(null)
  const [, setAnimating] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [genOpen, setGenOpen] = useState(false)
  const [, setOutcomeInfo] = useState<{ partyWins: boolean; partyTotal: number; bossPower: number; ratio: number } | null>(null)
  const [showIntro, setShowIntro] = useState(true)
  const [stage, setStage] = useState(1)
  const [showStageClear, setShowStageClear] = useState(false)

  // Book/Encyclopedia states
  const [showBook, setShowBook] = useState(false)
  const [bookPage, setBookPage] = useState(0)

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false)

  // Dice states
  const [showDice, setShowDice] = useState(false)
  const [diceRolling, setDiceRolling] = useState(false)
  const [diceValue, setDiceValue] = useState(1)
  const [diceResult, setDiceResult] = useState<DiceResult | null>(null)
  const [dicePhase, setDicePhase] = useState<DicePhase>('idle')
  const [diceRotX, setDiceRotX] = useState(0)
  const [diceRotY, setDiceRotY] = useState(0)
  const [diceScale, setDiceScale] = useState(1)
  const [sparks, setSparks] = useState<SparkParticle[]>([])
  const diceAnimRef = useRef<number | null>(null)
  const diceHistoryRef = useRef<number[]>([])

  // Sync refs with state
  useEffect(() => { modeR.current = mode }, [mode])
  useEffect(() => { stepR.current = step }, [step])
  useEffect(() => { fpR.current = fp }, [fp])
  useEffect(() => { ppR.current = pp }, [pp])
  useEffect(() => { stageR.current = stage }, [stage])

  // Show book during battle loading phase
  useEffect(() => {
    if (bPhase === 'loading') {
      setShowBook(true)
      setBookPage(0)
    } else if (bPhase === 'playing' || bPhase === 'error' || bPhase === 'done' || bPhase === 'lost') {
      setShowBook(false)
    }
  }, [bPhase])

  // BGM switching based on mode and intro state
  useEffect(() => {
    if (showIntro) return
    if (mode === 'battle') {
      audioManager.playBGM('battle')
    } else {
      audioManager.playBGM('field')
    }
  }, [mode, showIntro])

  // Play lose SE when battle is lost
  useEffect(() => {
    if (bPhase === 'lost') {
      audioManager.playSE('lose')
    }
  }, [bPhase])

  const nextBoss = getScaledBoss(stage)
  const superUnlocked = stage >= 2

  // Spawn hit effect
  const spawnHitEffect = useCallback((position: THREE.Vector3, element: string) => {
    const scene = sceneRef.current
    if (!scene) return

    const cfgs: Record<string, { colors: string[]; count: number; speed: number; grav: number; life: number; spread: number; up: number; sz: [number, number]; em: boolean }> = {
      fire: { colors: ['#ff4400', '#ff8800', '#ffcc00'], count: 55, speed: 0.14, grav: -0.003, life: 50, spread: 0.7, up: 0.2, sz: [0.1, 0.35], em: true },
      water: { colors: ['#0088ff', '#00ccff', '#44ddff'], count: 50, speed: 0.15, grav: 0.005, life: 44, spread: 1.2, up: 0.12, sz: [0.08, 0.28], em: true },
      wind: { colors: ['#44ff88', '#22cc66', '#88ffaa'], count: 45, speed: 0.08, grav: -0.001, life: 60, spread: 0.9, up: 0.04, sz: [0.07, 0.22], em: true },
      earth: { colors: ['#cc8833', '#aa6622', '#ddaa44'], count: 50, speed: 0.18, grav: 0.008, life: 35, spread: 1.0, up: 0.16, sz: [0.12, 0.35], em: false },
      dark: { colors: ['#aa44ff', '#8800cc', '#cc66ff'], count: 55, speed: 0.1, grav: -0.002, life: 58, spread: 0.6, up: 0.02, sz: [0.08, 0.28], em: true },
      light: { colors: ['#ffdd44', '#ffffff', '#ffeeaa'], count: 60, speed: 0.12, grav: -0.003, life: 52, spread: 0.8, up: 0.06, sz: [0.06, 0.25], em: true }
    }
    const cfg = cfgs[element] || cfgs.fire

    for (let i = 0; i < cfg.count; i++) {
      const cl = cfg.colors[Math.floor(Math.random() * cfg.colors.length)]
      const sz = cfg.sz[0] + Math.random() * (cfg.sz[1] - cfg.sz[0])
      const geo = Math.random() > 0.35 ? new THREE.SphereGeometry(sz, 8, 8) : new THREE.BoxGeometry(sz, sz, sz)
      const mat = new THREE.MeshStandardMaterial({ color: cl, emissive: cfg.em ? cl : '#000', emissiveIntensity: cfg.em ? 1.2 : 0, transparent: true, opacity: 1 })
      const m = new THREE.Mesh(geo, mat)
      m.position.copy(position)
      const ang = Math.random() * Math.PI * 2
      const elev = (Math.random() - 0.3) * Math.PI * 0.5
      const spd = cfg.speed * (0.3 + Math.random())
      m.userData._fx = { vx: Math.cos(ang) * Math.cos(elev) * spd * cfg.spread, vy: cfg.up * (0.4 + Math.random()) + Math.sin(elev) * spd * 0.3, vz: Math.sin(ang) * Math.cos(elev) * spd * cfg.spread, grav: cfg.grav, life: Math.floor(cfg.life * (0.5 + Math.random() * 0.7)), age: 0, spiralR: 0, spiralAng: ang }
      scene.add(m)
      effectsRef.current.push(m)
    }

    const fl = new THREE.PointLight(new THREE.Color(cfg.colors[0]), 8, 18)
    fl.position.copy(position)
    fl.userData._fx = { life: 22, age: 0, isLight: true }
    scene.add(fl)
    effectsRef.current.push(fl)
  }, [])

  spawnFxRef.current = spawnHitEffect

  // Clear highlights
  const clearHighlights = useCallback(() => {
    genRef.current.forEach(o => {
      o.traverse(c => {
        if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).material && c.userData._selSaved !== undefined) {
          const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial
          mat.emissive.setHex(c.userData._selEmHex)
          mat.emissiveIntensity = c.userData._selEmI
          delete c.userData._selSaved
          delete c.userData._selEmHex
          delete c.userData._selEmI
        }
      })
    })
    const scene = sceneRef.current
    if (scene) {
      arrowsRef.current.forEach(a => {
        scene.remove(a)
        a.traverse(c => {
          if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose()
          if ((c as THREE.Mesh).material) ((c as THREE.Mesh).material as THREE.Material).dispose()
        })
      })
      arrowsRef.current = []
    }
  }, [])

  // Run attack animation
  const runAtkAnim = useCallback((atk: THREE.Object3D | null, tgt: THREE.Object3D | null, onDone: (() => void) | undefined, element: string) => {
    if (!atk || !tgt) { onDone?.(); return }
    const hp = atk.position.clone()
    const tp = tgt.position.clone()
    const dir = new THREE.Vector3().subVectors(tp, hp).normalize()
    const hitP = tp.clone().sub(dir.multiplyScalar(2.0))
    setAnimating(true)
    animRef.current = { active: true, phase: 'forward', progress: 0, attacker: atk, target: tgt, homePos: hp, hitPos: hitP, targetHome: tgt.position.clone(), effectSpawned: false, element: element || 'fire', knockStarted: false, knockDir: null, knockDist: 0, onComplete: () => { setAnimating(false); onDone?.() } }
  }, [])

  // Play defeat animation
  const playDefeatAnim = useCallback((obj: THREE.Object3D | null) => {
    if (!obj) return
    defeatAnimRef.current.push({ obj, progress: 0, startRotZ: obj.rotation.z, startRotX: obj.rotation.x, startY: obj.position.y, targetRotZ: Math.PI / 2, done: false })
  }, [])

  // Play victory animation
  const playVictoryAnim = useCallback((objs: THREE.Object3D[]) => {
    objs.forEach((obj, i) => {
      if (!obj) return
      victoryAnimRef.current.push({ obj, progress: 0, baseY: obj.position.y, delay: i * 15, started: false, done: false })
    })
  }, [])

  // Dice roll functions
  const pickWeightedFace = useCallback(() => {
    const hist = diceHistoryRef.current
    const weights = [1, 2, 3, 4, 5, 6].map(v => {
      const lastIdx = hist.lastIndexOf(v)
      if (lastIdx === -1) return 10
      const ago = hist.length - lastIdx
      if (ago <= 1) return 0.5
      if (ago <= 2) return 2
      if (ago <= 3) return 5
      return 10
    })
    const total = weights.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    for (let i = 0; i < 6; i++) {
      r -= weights[i]
      if (r <= 0) return i + 1
    }
    return Math.floor(Math.random() * 6) + 1
  }, [])

  const rollDice = useCallback(() => {
    setShowDice(true)
    setDiceRolling(true)
    setDiceResult(null)
    setDicePhase('spinning')
    setDiceScale(1)
    setSparks([])

    const final = pickWeightedFace()
    diceHistoryRef.current.push(final)
    if (diceHistoryRef.current.length > 15) diceHistoryRef.current = diceHistoryRef.current.slice(-10)

    const totalDur = 2200
    const start = Date.now()
    let lastFace = Date.now()
    const displayHist: number[] = []

    const pickDisplay = () => {
      const last = displayHist.length > 0 ? displayHist[displayHist.length - 1] : -1
      const weights: number[] = [1, 2, 3, 4, 5, 6].map(v => v === last ? 0 : 10)
      const total = weights.reduce((a: number, b: number) => a + b, 0)
      let r = Math.random() * total
      for (let i = 0; i < 6; i++) {
        r -= weights[i]
        if (r <= 0) { displayHist.push(i + 1); return i + 1 }
      }
      return Math.floor(Math.random() * 6) + 1
    }

    const anim = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(1, elapsed / totalDur)
      const ease = 1 - Math.pow(1 - progress, 3)

      const rotSpeed = (1 - ease) * 25 + 0.5
      setDiceRotX(prev => prev + rotSpeed)
      setDiceRotY(prev => prev + rotSpeed * 0.7)

      if (progress < 0.15) setDiceScale(1 + progress * 2)
      else if (progress < 0.3) setDiceScale(1.3 - (progress - 0.15) * 2)
      else setDiceScale(1)

      const faceInterval = 50 + ease * 250
      if (Date.now() - lastFace > faceInterval) {
        lastFace = Date.now()
        if (progress < 0.85) setDiceValue(pickDisplay())
        else setDiceValue(final)
      }

      if (progress < 0.8 && Math.random() > 0.6) {
        setSparks(prev => [...prev.slice(-12), {
          id: Date.now() + Math.random(),
          x: 50 + (Math.random() - 0.5) * 80,
          y: 50 + (Math.random() - 0.5) * 80,
          size: 2 + Math.random() * 4,
          color: ['#ffd700', '#ff8800', '#00ffff', '#ff00ff'][Math.floor(Math.random() * 4)]
        }])
      }

      if (progress >= 0.85) setDicePhase('slowing')

      if (progress >= 1) {
        setDiceValue(final)
        setDicePhase('landing')
        setDiceRotX(0)
        setDiceRotY(0)
        setSparks([])

        const bounceStart = Date.now()
        const bounce = () => {
          const bp = Math.min(1, (Date.now() - bounceStart) / 400)
          const bs = 1 + Math.sin(bp * Math.PI * 2.5) * 0.15 * (1 - bp)
          setDiceScale(bs)
          if (bp < 1) requestAnimationFrame(bounce)
          else {
            setDiceScale(1)
            setDicePhase('done')
            setDiceRolling(false)
            let outcome: 'fail' | 'normal' | 'super', mult: number
            if (final <= 2) { outcome = 'fail'; mult = 0 }
            else if (final <= 4) { outcome = 'normal'; mult = 1 }
            else { outcome = 'super'; mult = 1.5 }
            setDiceResult({ value: final, outcome, mult })
          }
        }
        bounce()
        return
      }
      diceAnimRef.current = requestAnimationFrame(anim)
    }
    diceAnimRef.current = requestAnimationFrame(anim)
  }, [pickWeightedFace])

  // Do fusion
  const doStartFusion = useCallback(async (isSuper = false) => {
    if (fp.length !== 2) return
    setFusionSt('generating')
    setStep(2)
    const s1 = genRef.current[fp[0]]?.userData?.stats as CharacterStats || {}
    const s2 = genRef.current[fp[1]]?.userData?.stats as CharacterStats || {}
    const mult = isSuper ? superMultRef.current : 1

    try {
      const r = await fetch('/api/fusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ char1: s1, char2: s2, isSuper, superMult: mult })
      })
      if (!r.ok) throw new Error(`API ${r.status}`)
      const d = await r.json()
      if (d.error) throw new Error(d.error)

      const obj = buildObj(d.model)
      if (obj) {
        removeFloatingParts(obj)
        adjustGround(obj)
        obj.userData.baseY = obj.position.y
      }
      fusionResRef.current = { obj, stats: d.stats, modelDef: d.model, isSuper: mult > 1 }
      if (mult > 1) {
        audioManager.playSE('ultrafusion_success')
      }
      setFusionSt('ready')
    } catch (e) {
      console.error(e)
      setFusionSt('failed')
    }
  }, [fp])

  const startNormalFusion = useCallback(() => {
    superMultRef.current = 1
    doStartFusion(false)
  }, [doStartFusion])

  const startSuperFusion = useCallback(() => {
    setShowDice(true)
    setDiceRolling(false)
    setDiceResult(null)
    setDicePhase('idle')
    setDiceScale(1)
    setDiceRotX(0)
    setDiceRotY(0)
    setDiceValue(Math.floor(Math.random() * 6) + 1)
    setSparks([])
  }, [])

  const closeDiceAndProceed = useCallback(() => {
    if (!diceResult) return
    const { outcome, mult } = diceResult
    setShowDice(false)
    setDiceResult(null)

    if (outcome === 'fail') {
      audioManager.playSE('ultrafusion_failure')
      const firstIdx = fpR.current[0]
      const firstStats = genRef.current[firstIdx]?.userData?.stats as CharacterStats || {}
      const histItem = history[firstIdx]
      const modelDef = histItem?.modelDef
      if (modelDef) {
        const obj = buildObj(modelDef)
        if (obj) { removeFloatingParts(obj); adjustGround(obj); obj.userData.baseY = obj.position.y }
        fusionResRef.current = { obj, stats: { ...firstStats }, modelDef, isSuper: false, isFailed: true }
      }
      setFusionSt('ready')
      setStep(2)
      return
    }
    superMultRef.current = mult
    doStartFusion(true)
  }, [diceResult, history, doStartFusion])

  // Setup battle
  const setupBattle = useCallback((partyIdxs: number[], boss: CharacterStats & { model: ModelPosition }) => {
    const scene = sceneRef.current
    const cam = camRef.current
    if (!scene || !cam) return

    clearHighlights()
    savedCamRef.current = { pos: cam.position.clone() }
    savedRef.current = genRef.current.map(o => ({ pos: o.position.clone(), rot: o.rotation.clone(), vis: o.visible }))
    genRef.current.forEach(o => { o.visible = false })

    // Lower ground for battle scene
    const grid = scene.getObjectByName('battleGrid')
    const gnd = scene.getObjectByName('battleGround')
    if (grid) grid.position.y = -4
    if (gnd) gnd.position.y = -4

    const pObjs: THREE.Object3D[] = []
    partyIdxs.forEach((idx, i) => {
      const obj = genRef.current[idx]
      if (!obj) return
      obj.visible = true
      const spread = partyIdxs.length > 1 ? (i - (partyIdxs.length - 1) / 2) * 2.5 : 0
      obj.position.set(-5, (obj.userData.baseY || 0) - 4, spread)
      obj.rotation.set(0, Math.PI * 0.5, 0)
      delete obj.userData.moveDir
      pObjs.push(obj)
    })
    partyBRef.current = pObjs

    const bossObj = buildObj(boss.model)
    const bossScale = 1.15 + (stageR.current - 1) * 0.1
    if (bossObj) {
      bossObj.scale.set(bossScale, bossScale, bossScale)
      bossObj.position.set(5, (bossObj.userData.baseY || 0) - 1, 0)
      bossObj.rotation.set(0, -Math.PI * 0.5, 0)
      bossObj.userData.float = true
      bossObj.userData.baseY = bossObj.position.y
      scene.add(bossObj)
      bossRef.current = bossObj
    }
    cam.position.set(0, 2, 16)
    cam.lookAt(0, -1, 0)
  }, [clearHighlights])

  // Teardown battle
  const teardownBattle = useCallback((won: boolean) => {
    const scene = sceneRef.current
    const cam = camRef.current
    if (!scene || !cam) return

    effectsRef.current.forEach(obj => {
      scene.remove(obj)
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose()
      if ((obj as THREE.Mesh).material) ((obj as THREE.Mesh).material as THREE.Material).dispose()
    })
    effectsRef.current = []
    defeatAnimRef.current = []
    victoryAnimRef.current = []

    if (bossRef.current) {
      scene.remove(bossRef.current)
      bossRef.current.traverse(c => {
        if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose()
        if ((c as THREE.Mesh).material) ((c as THREE.Mesh).material as THREE.Material).dispose()
      })
      bossRef.current = null
    }

    if (fusionBRef.current) {
      scene.remove(fusionBRef.current)
      fusionBRef.current.traverse(c => {
        if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose()
        if ((c as THREE.Mesh).material) ((c as THREE.Mesh).material as THREE.Material).dispose()
      })
      fusionBRef.current = null
    }
    partyBRef.current = []

    genRef.current.forEach((o, i) => {
      const sv = savedRef.current[i]
      if (sv) {
        o.position.copy(sv.pos)
        o.rotation.copy(sv.rot)
        o.visible = sv.vis
      } else o.visible = true
      delete o.userData.moveDir
    })

    if (savedCamRef.current) {
      cam.position.copy(savedCamRef.current.pos)
      cam.lookAt(0, 0, 0)
    }

    // Restore ground position for field scene
    const grid = scene.getObjectByName('battleGrid')
    const gnd = scene.getObjectByName('battleGround')
    if (grid) grid.position.y = 0
    if (gnd) gnd.position.y = 0

    if (fusionResRef.current && won) {
      const fRes = fusionResRef.current
      fusionResRef.current = null
      const fpIndices = [...fpR.current].sort((a, b) => b - a)
      fpIndices.forEach(idx => {
        const o = genRef.current[idx]
        if (o) {
          scene.remove(o)
          o.traverse(c => {
            if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose()
            if ((c as THREE.Mesh).material) ((c as THREE.Mesh).material as THREE.Material).dispose()
          })
        }
        genRef.current.splice(idx, 1)
      })

      const fObj = fRes.obj as THREE.Object3D
      if (fObj) {
        fObj.position.set(0, fObj.userData?.baseY || 0, 0)
        fObj.userData.stats = fRes.stats
        fObj.userData.baseY = fObj.position.y
        scene.add(fObj)
        genRef.current.push(fObj)
        setHistory(p => {
          const newH = p.filter((_, i) => !fpR.current.includes(i))
          return [...newH, { prompt: 'FUSION', modelDef: fRes.modelDef, stats: { ...fRes.stats }, timestamp: Date.now(), isFusion: true, isSuper: fRes.isSuper }]
        })
      }
    } else {
      fusionResRef.current = null
    }
    curBossRef.current = null
  }, [])

  // Find party object by name
  const findPartyObj = useCallback((name: string): THREE.Object3D | null => {
    for (let i = 0; i < ppR.current.length; i++) {
      const idx = ppR.current[i]
      const s = genRef.current[idx]?.userData?.stats as CharacterStats
      if (s && s.name === name) return partyBRef.current[i]
    }
    if (fusionBRef.current) return fusionBRef.current
    return partyBRef.current[0] || null
  }, [])

  // Start battle
  const startBattle = useCallback(async () => {
    const boss = getScaledBoss(stage)
    curBossRef.current = boss
    setStep(3)
    setMode('battle')
    setBPhase('loading')
    setBLog([`⚔️ STAGE ${stage} — ${boss.name}が現れた！`, '🔄 融合完了を待機中...'])
    setupBattle(pp, boss)

    const partyStats = pp.map(idx => genRef.current[idx]?.userData?.stats as CharacterStats || {})

    const waitFusion = (): Promise<FusionResult> => new Promise(res => {
      const chk = () => {
        if (fusionResRef.current) { res(fusionResRef.current); return }
        setTimeout(chk, 500)
      }
      chk()
    })

    const fusionRes = await waitFusion()
    const fusionStats = fusionRes.stats
    const outcome = calcBattleOutcome(partyStats, fusionStats, boss)
    setOutcomeInfo(outcome)
    const winnerStr = outcome.partyWins ? 'party' : 'boss'

    setBLog([`⚔️ STAGE ${stage} — ${boss.name}が現れた！`, '🔄 バトル展開を生成中...'])

    try {
      const r = await fetch('/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyStats,
          fusionStats,
          boss: { name: boss.name, hp: boss.hp, attack: boss.attack, defense: boss.defense, element: boss.element },
          stage,
          winner: winnerStr
        })
      })
      if (!r.ok) throw new Error(`API ${r.status}`)
      const d = await r.json()
      if (d.error) throw new Error(d.error)

      const events = d.events
      const initHP: BattleHPState = {
        bossHp: boss.hp,
        bossMax: boss.hp,
        party: partyStats.map(p => ({ name: p.name, hp: p.hp || 100, max: p.hp || 100, alive: true })),
        fusion: null
      }
      setBHP(initHP)
      setBLog([`⚔️ STAGE ${stage} — ${boss.name}が現れた！`])
      setBPhase('playing')
      playEvents(events, initHP, boss)
    } catch (e) {
      console.error(e)
      setBLog(p => [...p, '❌ バトル生成失敗: ' + (e instanceof Error ? e.message : String(e))])
      setBPhase('error')
    }
  }, [pp, setupBattle, stage, findPartyObj, runAtkAnim, playDefeatAnim, playVictoryAnim])

  // Play battle events
  const playEvents = useCallback((events: Array<{ actor: string; action: string; target?: string; damage?: number; text: string; crit?: boolean; winner?: string; fusionName?: string }>, initHP: BattleHPState, boss: CharacterStats & { name: string }) => {
    let idx = 0
    const hp = { ...initHP, party: initHP.party.map(p => ({ ...p })) }

    const next = () => {
      if (idx >= events.length) { setBPhase('done'); return }
      const ev = events[idx]
      idx++

      if (ev.action === 'fusion_arrive') {
        setBLog(p => [...p, ''])
        const tryA = () => {
          if (fusionResRef.current) {
            const fRes = fusionResRef.current
            const fObj = fRes.obj as THREE.Object3D
            if (fObj && sceneRef.current) {
              const slotZ = partyBRef.current.length > 0 ? partyBRef.current[partyBRef.current.length - 1].position.z + 2.5 : 0
              fObj.position.set(-5, 3, slotZ)
              fObj.rotation.set(0, Math.PI * 0.5, 0)
              sceneRef.current.add(fObj)
              fusionBRef.current = fObj
              partyBRef.current.push(fObj)
              const targetY = (fObj.userData?.baseY || 0) - 4
              const drop = () => {
                if (fObj.position.y > targetY) {
                  fObj.position.y -= 0.15
                  requestAnimationFrame(drop)
                } else fObj.position.y = targetY
              }
              drop()
            }
            hp.fusion = { name: fRes.stats.name, hp: fRes.stats.hp || 200, max: fRes.stats.hp || 200 }
            setBHP({ ...hp, fusion: { ...hp.fusion } })
            setBLog(p => { const n = [...p]; n[n.length - 1] = `✨ ${ev.text || fRes.stats.name + 'が参戦！'}`; return n })
            setTimeout(next, 4500)
          } else {
            setBLog(p => { const n = [...p]; n[n.length - 1] = '⏳ 融合完了を待っています...'; return n })
            setTimeout(tryA, 1000)
          }
        }
        tryA()
        return
      }

      if (ev.action === 'result') {
        const won = ev.winner === 'party'
        setBLog(p => [...p, `${won ? '🎉' : '💀'} ${ev.text || (won ? '勝利！' : '敗北...')}`])
        if (won) {
          audioManager.playSE('win')
          playDefeatAnim(bossRef.current)
          const winners = [...partyBRef.current]
          if (fusionBRef.current) winners.push(fusionBRef.current)
          setTimeout(() => playVictoryAnim(winners), 800)
        } else {
          partyBRef.current.forEach(o => playDefeatAnim(o))
          if (fusionBRef.current) playDefeatAnim(fusionBRef.current)
        }
        setBPhase(won ? 'done' : 'lost')
        return
      }

      if (ev.action === 'event' || ev.action === 'drama') {
        setBLog(p => [...p, `🌋 ${ev.text}`])
        if (ev.damage && ev.damage > 0) {
          if (ev.target === boss.name) {
            hp.bossHp = Math.max(0, hp.bossHp - ev.damage)
          } else if (ev.target) {
            hp.party = hp.party.map(p => {
              if (p.name === ev.target && p.alive) return { ...p, hp: Math.max(0, p.hp - ev.damage!), alive: Math.max(0, p.hp - ev.damage!) > 0 }
              return p
            })
            if (hp.fusion && hp.fusion.name === ev.target) hp.fusion.hp = Math.max(0, hp.fusion.hp - ev.damage)
          }
          setBHP({ ...hp, party: hp.party.map(p => ({ ...p })), fusion: hp.fusion ? { ...hp.fusion } : null })
        }
        setTimeout(next, 4500)
        return
      }

      setBLog(p => [...p, `${ev.crit ? '💥' : '⚔️'} ${ev.text}`])
      const isBA = ev.actor === boss.name
      const atkObj = isBA ? bossRef.current : findPartyObj(ev.actor)
      const tgtObj = isBA ? findPartyObj(ev.target || '') : bossRef.current
      const dmg = ev.damage || 0
      const atkElem = isBA ? (boss.element || 'dark') : (() => {
        for (let i = 0; i < ppR.current.length; i++) {
          const s = genRef.current[ppR.current[i]]?.userData?.stats as CharacterStats
          if (s && s.name === ev.actor) return s.element || 'fire'
        }
        if (fusionResRef.current && fusionResRef.current.stats.name === ev.actor) return fusionResRef.current.stats.element || 'fire'
        return 'fire'
      })()

      runAtkAnim(atkObj, tgtObj, () => {
        if (isBA) {
          let found = false
          hp.party = hp.party.map(p => {
            if (p.name === ev.target && p.alive) {
              found = true
              const nh = Math.max(0, p.hp - dmg)
              return { ...p, hp: nh, alive: nh > 0 }
            }
            return p
          })
          if (!found && hp.fusion) hp.fusion.hp = Math.max(0, hp.fusion.hp - dmg)
        } else hp.bossHp = Math.max(0, hp.bossHp - dmg)
        setBHP({ ...hp, party: hp.party.map(p => ({ ...p })), fusion: hp.fusion ? { ...hp.fusion } : null })
        setTimeout(next, 3500)
      }, atkElem)
    }
    setTimeout(next, 3500)
  }, [findPartyObj, runAtkAnim, playDefeatAnim, playVictoryAnim])

  // End battle
  const endBattle = useCallback((won: boolean) => {
    teardownBattle(won)
    if (won) {
      setStage(s => s + 1)
      setShowStageClear(true)
    }
    const scene = sceneRef.current
    if (scene && pendingCharsRef.current.length > 0) {
      pendingCharsRef.current.forEach(pc => {
        pc.obj.visible = true
        scene.add(pc.obj)
        genRef.current.push(pc.obj)
      })
      const newHist = pendingCharsRef.current.map(pc => ({ prompt: pc.prompt, modelDef: pc.modelDef, stats: { ...pc.stats }, timestamp: Date.now() }))
      setHistory(p => [...p, ...newHist])
      pendingCharsRef.current = []
    }
    setMode('field')
    setBPhase(null)
    setBLog([])
    setBHP(null)
    setStep(0)
    setFp([])
    setPp([])
    setFusionSt(null)
    setOutcomeInfo(null)
  }, [teardownBattle])

  // Generate object
  const genObj = useCallback(async () => {
    if (!prompt.trim() || isGen) return
    setIsGen(true)
    setError(null)
    setGenOpen(false)

    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      if (!r.ok) throw new Error(`API ${r.status}`)
      const d = await r.json()
      if (d.error) throw new Error(d.error)

      const obj = buildObj(d.model)
      if (obj) {
        removeFloatingParts(obj)
        adjustGround(obj)
        const cnt = genRef.current.length
        const ang = (cnt * 137.5 * Math.PI) / 180
        const rad = 2 + Math.floor(cnt / 6) * 2.5
        obj.position.x += Math.cos(ang) * rad + (Math.random() - 0.5) * 2
        obj.position.z += Math.sin(ang) * rad + (Math.random() - 0.5) * 2
        obj.userData.baseY = obj.position.y
        obj.userData.stats = { ...d.stats }

        if (modeR.current !== 'field') {
          obj.visible = false
          pendingCharsRef.current.push({ obj, modelDef: d.model, stats: { ...d.stats }, prompt })
        } else {
          sceneRef.current?.add(obj)
          genRef.current.push(obj)
          setHistory(p => [...p, { prompt, modelDef: d.model, stats: { ...d.stats }, timestamp: Date.now() }])
        }
      }
      setPrompt('')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsGen(false)
    }
  }, [prompt, isGen])

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0f)
    scene.fog = new THREE.Fog(0x0a0a0f, 20, 80)
    sceneRef.current = scene

    const cam = new THREE.PerspectiveCamera(60, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000)
    cam.position.set(0, 8, 20)
    cam.lookAt(0, 0, 0)
    camRef.current = cam

    const ren = new THREE.WebGLRenderer({ antialias: true })
    ren.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    ren.shadowMap.enabled = true
    ren.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(ren.domElement)
    renRef.current = ren

    scene.add(new THREE.AmbientLight(0x404060, 0.5))
    const dl = new THREE.DirectionalLight(0xffffff, 1)
    dl.position.set(10, 20, 10)
    dl.castShadow = true
    scene.add(dl)
    const p1 = new THREE.PointLight(0x00ffff, 1, 50)
    p1.position.set(-10, 5, 10)
    scene.add(p1)
    const p2 = new THREE.PointLight(0xff00ff, 1, 50)
    p2.position.set(10, 5, -10)
    scene.add(p2)

    const grid = new THREE.GridHelper(100, 50, 0x00ffff, 0x1a1a2e)
    grid.position.y = 0
    grid.name = 'battleGrid'
    scene.add(grid)
    const gnd = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x0a0a15, roughness: 0.8, metalness: 0.2 }))
    gnd.rotation.x = -Math.PI / 2
    gnd.position.y = 0
    gnd.name = 'battleGround'
    gnd.receiveShadow = true
    scene.add(gnd)

    // Initialize characters
    if (!initDoneRef.current) {
      initDoneRef.current = true
      const pos: [number, number, number][] = [[-4, 0, -2], [0, 0, 3], [5, 0, -1]]
      INITIAL_CHARS.forEach((cd, i) => {
        const obj = buildObj(cd.model)
        if (obj) {
          removeFloatingParts(obj)
          adjustGround(obj)
          obj.position.x = pos[i][0]
          obj.position.z = pos[i][2]
          obj.userData.baseY = obj.position.y
          obj.userData.stats = { ...cd.stats }
          scene.add(obj)
          genRef.current.push(obj)
        }
      })
      setHistory(INITIAL_CHARS.map((c, i) => ({ prompt: c.stats.name, modelDef: c.model, stats: { ...c.stats }, timestamp: Date.now() - (INITIAL_CHARS.length - i) })))
    }

    const DIRS = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5]
    let aId: number

    const animate = () => {
      aId = requestAnimationFrame(animate)
      const t = Date.now() * 0.003

      // Field mode - character wandering
      if (modeR.current === 'field') {
        genRef.current.forEach(obj => {
          if (!obj.visible) return
          if (obj.userData.moveDir === undefined) {
            obj.userData.dirIdx = Math.floor(Math.random() * 4)
            obj.userData.moveDir = DIRS[obj.userData.dirIdx]
            obj.userData.spd = 0.008 + Math.random() * 0.007
            obj.userData.dist = 0
            obj.userData.stepsLeft = 5
          }
          const s = obj.userData.spd
          obj.position.x += Math.sin(obj.userData.moveDir) * s
          obj.position.z += Math.cos(obj.userData.moveDir) * s
          obj.userData.dist += s
          if (obj.userData.dist >= obj.userData.stepsLeft * 0.5) {
            obj.userData.dist = 0
            obj.userData.dirIdx = Math.floor(Math.random() * 4)
            obj.userData.moveDir = DIRS[obj.userData.dirIdx]
            obj.userData.stepsLeft = 4 + Math.random() * 2
          }
          let rd = obj.userData.moveDir - obj.rotation.y
          while (rd > Math.PI) rd -= Math.PI * 2
          while (rd < -Math.PI) rd += Math.PI * 2
          obj.rotation.y += rd * 0.15
          const B = 12
          if (Math.abs(obj.position.x) > B || Math.abs(obj.position.z) > B) {
            obj.position.x = Math.max(-B, Math.min(B, obj.position.x))
            obj.position.z = Math.max(-B, Math.min(B, obj.position.z))
            obj.userData.dirIdx = Math.floor(Math.random() * 4)
            obj.userData.moveDir = DIRS[obj.userData.dirIdx]
            obj.userData.dist = 0
          }
          if (obj.userData.float) obj.position.y = (obj.userData.baseY || 3) + Math.sin(t) * 0.5
        })
      }

      // Arrows
      if (arrowsRef.current.length > 0) {
        arrowsRef.current.forEach(arrow => {
          const idx = arrow.userData._targetIdx
          const target = genRef.current[idx]
          if (target && target.visible) {
            arrow.visible = true
            arrow.position.set(target.position.x, target.position.y + 2.5 + Math.sin(t * 2.5) * 0.2, target.position.z)
          } else arrow.visible = false
        })
      }

      // Attack animation
      const ba = animRef.current
      if (ba && ba.active) {
        ba.progress += ba.phase === 'knockReturn' ? 0.012 : 0.025
        if (ba.phase === 'forward') {
          const p = Math.min(1, ba.progress)
          ba.attacker.position.lerpVectors(ba.homePos, ba.hitPos, 1 - Math.pow(1 - p, 3))
          if (p >= 1) { ba.phase = 'hit'; ba.progress = 0 }
        } else if (ba.phase === 'hit') {
          if (!ba.effectSpawned && ba.target && spawnFxRef.current) {
            ba.effectSpawned = true
            spawnFxRef.current(ba.targetHome.clone(), ba.element)
            audioManager.playSE('hit')
          }
          if (ba.target) {
            if (!ba.knockStarted) {
              ba.knockStarted = true
              ba.knockDir = new THREE.Vector3().subVectors(ba.targetHome, ba.homePos).normalize()
              ba.knockDist = 0
            }
            if (ba.knockDist < 4.0) {
              const kspd = 0.25
              ba.target.position.x = ba.targetHome.x + ba.knockDir!.x * ba.knockDist
              ba.target.position.z = ba.targetHome.z + ba.knockDir!.z * ba.knockDist
              ba.knockDist += kspd
              ba.target.rotation.z = (Math.random() - 0.5) * 0.4
              ba.target.position.y = ba.targetHome.y + (Math.random() - 0.5) * 0.3
            }
            ba.target.traverse(c => {
              if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).material) {
                const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial
                if (c.userData._fc === undefined) {
                  c.userData._fc = mat.color.getHex()
                  c.userData._fe = mat.emissive.getHex()
                  c.userData._fi = mat.emissiveIntensity
                }
                mat.color.setHex(0xffffff)
                mat.emissive.setHex(0xff4444)
                mat.emissiveIntensity = 1
              }
            })
          }
          if (ba.progress >= 0.4) {
            if (ba.target) {
              ba.target.traverse(c => {
                if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).material && c.userData._fc !== undefined) {
                  const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial
                  mat.color.setHex(c.userData._fc)
                  mat.emissive.setHex(c.userData._fe)
                  mat.emissiveIntensity = c.userData._fi
                  delete c.userData._fc
                  delete c.userData._fe
                  delete c.userData._fi
                }
              })
              ba.target.rotation.z = 0
            }
            ba.phase = 'knockReturn'
            ba.progress = 0
            ba.knockReturnStart = ba.target ? ba.target.position.clone() : ba.targetHome.clone()
          }
        } else if (ba.phase === 'knockReturn') {
          const p = Math.min(1, ba.progress)
          const ease = p * p * (3 - 2 * p)
          if (ba.target) ba.target.position.lerpVectors(ba.knockReturnStart!, ba.targetHome, ease)
          if (p >= 1) {
            if (ba.target) ba.target.position.copy(ba.targetHome)
            ba.phase = 'return'
            ba.progress = 0
          }
        } else if (ba.phase === 'return') {
          const p = Math.min(1, ba.progress)
          ba.attacker.position.lerpVectors(ba.hitPos, ba.homePos, p)
          if (p >= 1) { ba.active = false; ba.onComplete?.() }
        }
      }

      // Boss float
      if (modeR.current === 'battle' && bossRef.current && bossRef.current.userData.float) {
        bossRef.current.position.y = (bossRef.current.userData.baseY || 7) + Math.sin(t) * 0.4
      }

      // Defeat animations
      defeatAnimRef.current.forEach(da => {
        if (da.done) return
        da.progress += 0.015
        const p = Math.min(1, da.progress)
        const ease = 1 - Math.pow(1 - p, 3)
        da.obj.rotation.z = da.startRotZ + (da.targetRotZ - da.startRotZ) * ease
        da.obj.rotation.x = (da.startRotX || 0) + ease * 0.4
        if (p > 0.2) da.obj.position.y = da.startY - ease * 1.5
        if (p > 0.6) {
          da.obj.traverse(c => {
            if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).material) {
              const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial
              mat.opacity = Math.max(0.3, 1 - ((p - 0.6) / 0.4) * 0.7)
              mat.transparent = true
            }
          })
        }
        if (p >= 1) da.done = true
      })

      // Victory animations
      victoryAnimRef.current.forEach(va => {
        if (!va.started) { va.delay--; if (va.delay > 0) return; va.started = true }
        va.progress += 0.032
        const cycle = va.progress % (Math.PI * 2)
        const jump = Math.abs(Math.sin(cycle)) * 2.5
        va.obj.position.y = va.baseY + jump
        va.obj.rotation.y += 0.04
      })

      // Limb animations
      const all = [...genRef.current, ...(bossRef.current ? [bossRef.current] : []), ...partyBRef.current, ...(fusionBRef.current ? [fusionBRef.current] : [])]
      all.forEach(obj => {
        if (!obj || !obj.visible) return
        obj.children && obj.children.forEach(c => {
          const p = c.userData.part
          if (!p) return
          const ws = 1.2
          if (p === 'leg_fl' || p === 'leg_br') c.rotation.x = Math.sin(t * ws) * 0.35
          else if (p === 'leg_fr' || p === 'leg_bl') c.rotation.x = Math.sin(t * ws + Math.PI) * 0.35
          else if (p === 'arm_l') { c.rotation.x = Math.sin(t * ws) * 0.25; c.rotation.z = c.userData.baseRotationZ ?? -0.2 }
          else if (p === 'arm_r') { c.rotation.x = Math.sin(t * ws + Math.PI) * 0.25; c.rotation.z = c.userData.baseRotationZ ?? 0.2 }
          else if (p === 'wing_l') c.rotation.z = 0.15 + Math.sin(t * 2) * 0.3
          else if (p === 'wing_r') c.rotation.z = -0.15 - Math.sin(t * 2) * 0.3
          else if (p === 'tail') c.rotation.y = Math.sin(t * 1.5) * 0.3
          else if (p === 'head') c.rotation.x = Math.sin(t * ws * 0.5) * 0.04
        })
      })

      // Effects
      effectsRef.current = effectsRef.current.filter(obj => {
        const fx = obj.userData._fx
        if (!fx) return false
        fx.age++
        if (fx.age >= fx.life) {
          scene.remove(obj)
          if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose()
          if ((obj as THREE.Mesh).material) ((obj as THREE.Mesh).material as THREE.Material).dispose()
          return false
        }
        const pr = fx.age / fx.life
        if (fx.isLight) {
          (obj as THREE.PointLight).intensity = 8 * (1 - pr)
        } else {
          obj.position.x += fx.vx
          obj.position.z += fx.vz
          obj.position.y += fx.vy
          fx.vy -= fx.grav
          const mat = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial
          mat.opacity = 1 - pr * pr
          const s = pr < 0.2 ? 1 + pr * 2 : 1.4 - pr * 0.6
          obj.scale.set(s, s, s)
          obj.rotation.x += 0.12
          obj.rotation.y += 0.18
        }
        return true
      })

      ren.render(scene, cam)
    }
    animate()

    const onResize = () => {
      if (!containerRef.current) return
      cam.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      cam.updateProjectionMatrix()
      ren.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', onResize)

    const onClick = (e: MouseEvent) => {
      if (modeR.current !== 'field') return
      const st = stepR.current
      if (st !== 0 && st !== 2) return
      const rect = containerRef.current!.getBoundingClientRect()
      ms.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      ms.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      rc.current.setFromCamera(ms.current, cam)
      const hits = rc.current.intersectObjects(genRef.current, true)
      if (hits.length > 0) {
        let obj = hits[0].object
        while (obj.parent && !genRef.current.includes(obj)) obj = obj.parent
        const idx = genRef.current.indexOf(obj)
        if (idx === -1) return
        if (st === 0) setFp(p => p.includes(idx) ? p.filter(j => j !== idx) : p.length >= 2 ? [p[1], idx] : [...p, idx])
        else if (st === 2) {
          if (fpR.current.includes(idx)) return
          setPp(p => p.includes(idx) ? p.filter(j => j !== idx) : [...p, idx])
        }
      }
    }
    ren.domElement.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(aId)
      window.removeEventListener('resize', onResize)
      ren.domElement.removeEventListener('click', onClick)
      ren.dispose()
      if (containerRef.current && ren.domElement) containerRef.current.removeChild(ren.domElement)
    }
  }, [])

  // Selection highlights
  useEffect(() => {
    genRef.current.forEach((obj, idx) => {
      const isFP = fp.includes(idx)
      const isPP = pp.includes(idx)
      const sel = isFP || isPP
      obj.traverse(c => {
        if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).material) {
          const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial
          if (sel && c.userData._selSaved === undefined) {
            c.userData._selSaved = true
            c.userData._selEmHex = mat.emissive.getHex()
            c.userData._selEmI = mat.emissiveIntensity
            mat.emissive.setHex(isFP ? 0xff00ff : 0x00ffff)
            mat.emissiveIntensity = 0.8
          } else if (sel && c.userData._selSaved) {
            mat.emissive.setHex(isFP ? 0xff00ff : 0x00ffff)
          } else if (!sel && c.userData._selSaved !== undefined) {
            mat.emissive.setHex(c.userData._selEmHex)
            mat.emissiveIntensity = c.userData._selEmI
            delete c.userData._selSaved
            delete c.userData._selEmHex
            delete c.userData._selEmI
          }
        }
      })
    })
  }, [fp, pp])

  // Arrow indicators
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    arrowsRef.current.forEach(a => {
      scene.remove(a)
      a.traverse(c => {
        if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose()
        if ((c as THREE.Mesh).material) ((c as THREE.Mesh).material as THREE.Material).dispose()
      })
    })
    arrowsRef.current = []
    if (step === 2) {
      genRef.current.forEach((obj, idx) => {
        if (fp.includes(idx) || pp.includes(idx)) return
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0xff4444, emissive: 0xff2222, emissiveIntensity: 0.8 }))
        arrow.rotation.x = Math.PI
        arrow.userData._targetIdx = idx
        scene.add(arrow)
        arrowsRef.current.push(arrow)
      })
    }
  }, [step, fp, pp])

  // Scroll log
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [bLog])

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #0a0a0f, #1a1a2e)', fontFamily: '"Orbitron", "Segoe UI", sans-serif', overflow: 'hidden', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)', pointerEvents: 'none', zIndex: 1 }} />

      {/* Dice Modal */}
      {showDice && (
        <DiceModal
          dicePhase={dicePhase}
          diceRolling={diceRolling}
          diceValue={diceValue}
          diceResult={diceResult}
          diceRotX={diceRotX}
          diceRotY={diceRotY}
          diceScale={diceScale}
          sparks={sparks}
          onRollDice={rollDice}
          onCloseDice={() => setShowDice(false)}
          onProceed={closeDiceAndProceed}
        />
      )}

      {/* Stage Clear Modal */}
      {showStageClear && (
        <StageClearModal stage={stage} nextBoss={nextBoss} onClose={() => setShowStageClear(false)} />
      )}

      {/* Field Mode UI */}
      {mode === 'field' && (
        <>
          <div style={{ position: 'absolute', top: 15, left: 20, zIndex: 10 }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#00ffff', textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff', letterSpacing: '0.15em', animation: 'pulse 2s infinite' }}>Fusion Monsters</h1>
            <div style={{ marginTop: 6 }}>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', color: '#ffd700', letterSpacing: '0.15em', padding: '3px 10px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 4, display: 'inline-block' }}>STAGE {stage}</div>
            </div>
          </div>

          {step === 0 && (
            <>
              {isGen && !genOpen && (
                <div style={{ position: 'absolute', bottom: 30, left: 20, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(10,10,20,0.85)', border: '1px solid #00ffff', borderRadius: 8, padding: '8px 14px', boxShadow: '0 0 15px rgba(0,255,255,0.2)', animation: 'pulse 1.5s infinite' }}>
                  <div style={{ width: 18, height: 18, border: '2px solid transparent', borderTop: '2px solid #00ffff', borderRight: '2px solid #00ffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', color: '#00ffff', letterSpacing: '0.05em' }}>Generating...</span>
                </div>
              )}

              {!genOpen && !isGen && (
                <button onClick={() => { audioManager.playSE('button'); setGenOpen(true) }} style={{ position: 'absolute', bottom: 30, left: 20, zIndex: 10, width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #00ffff, #00aaaa)', border: 'none', cursor: 'pointer', boxShadow: '0 0 25px rgba(0,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>✦</button>
              )}

              {!genOpen && fp.length === 0 && (
                <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 5, fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}><span style={{ color: 'rgba(255,255,255,0.25)' }}>✦</span> モンスターを生成 / 2体クリックで融合へ</div>
              )}

              {genOpen && (
                <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: '90%', maxWidth: 700 }}>
                  <div style={{ background: 'rgba(10,10,20,0.9)', border: '1px solid #00ffff', borderRadius: 8, padding: 20, boxShadow: '0 0 30px rgba(0,255,255,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', color: '#00ffff', letterSpacing: '0.1em' }}>CHARACTER GENERATE</span>
                      <button onClick={() => setGenOpen(false)} style={{ background: 'none', border: '1px solid #555', borderRadius: '50%', width: 28, height: 28, color: '#888', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} onKeyPress={e => e.key === 'Enter' && genObj()} placeholder="キャラクターを生成（例：炎の魔法使い）" disabled={isGen} style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid #333', borderRadius: 4, padding: '12px 18px', fontSize: '1rem', color: '#fff', fontFamily: 'Rajdhani, sans-serif', outline: 'none' }} />
                      <button onClick={() => { audioManager.playSE('button'); genObj() }} disabled={isGen || !prompt.trim()} style={{ background: isGen ? '#333' : 'linear-gradient(135deg, #00ffff, #00aaaa)', border: 'none', borderRadius: 4, padding: '12px 25px', fontSize: '0.95rem', fontWeight: 700, color: isGen ? '#666' : '#000', fontFamily: 'Orbitron, sans-serif', cursor: isGen ? 'not-allowed' : 'pointer', boxShadow: isGen ? 'none' : '0 0 20px rgba(0,255,255,0.5)' }}>{isGen ? '生成中...' : '生成'}</button>
                    </div>
                    {error && <div style={{ marginTop: 10, padding: 8, background: 'rgba(255,0,100,0.2)', border: '1px solid #ff0066', borderRadius: 4, color: '#ff0066', fontSize: '0.8rem', fontFamily: 'Rajdhani, sans-serif' }}>{error}</div>}
                  </div>
                </div>
              )}

              {/* Fusion Panel */}
              {fp.length > 0 && history.length >= 3 && (
                <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 20, width: '85%', maxWidth: 400 }}>
                  <div style={{ background: 'rgba(10,10,20,0.95)', border: '1.5px solid #ff00ff', borderRadius: 10, padding: 14, boxShadow: '0 0 25px rgba(255,0,255,0.25)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', color: '#ff00ff' }}>⚡ FUSION</span>
                      <button onClick={() => setFp([])} style={{ background: 'none', border: '1px solid #555', borderRadius: '50%', width: 24, height: 24, color: '#888', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
                      {[0, 1].map(i => {
                        const idx = fp[i]
                        const s = idx !== undefined ? genRef.current[idx]?.userData?.stats as CharacterStats : null
                        return (
                          <div key={i} style={{ padding: '6px 14px', background: s ? 'rgba(255,0,255,0.15)' : 'rgba(255,255,255,0.05)', border: `1px dashed ${s ? '#ff00ff' : '#555'}`, borderRadius: 6, minWidth: 90, textAlign: 'center' }}>
                            {s ? (
                              <>
                                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.75rem' }}>{s.name}</div>
                                <div style={{ fontSize: '0.6rem', color: EC[s.element as Element] || '#888' }}>{EName[s.element as Element] || s.element} ★{s.rarity}</div>
                              </>
                            ) : (
                              <div style={{ color: '#555', fontSize: '0.65rem', fontFamily: 'Rajdhani, sans-serif' }}>未選択</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { audioManager.playSE('button'); startNormalFusion() }} disabled={fp.length !== 2} style={{ flex: 1, background: fp.length === 2 ? 'linear-gradient(135deg, #ff00ff, #aa00aa)' : '#333', border: 'none', borderRadius: 5, padding: 9, fontSize: '0.75rem', fontWeight: 700, color: fp.length === 2 ? '#fff' : '#666', fontFamily: 'Orbitron, sans-serif', cursor: fp.length === 2 ? 'pointer' : 'not-allowed', boxShadow: fp.length === 2 ? '0 0 15px rgba(255,0,255,0.4)' : 'none' }}>⚡ FUSION</button>
                      {superUnlocked && (
                        <button onClick={() => { audioManager.playSE('button'); startSuperFusion() }} disabled={fp.length !== 2} style={{ flex: 1, background: fp.length === 2 ? 'linear-gradient(135deg, #ffd700, #ff8800)' : '#333', border: 'none', borderRadius: 5, padding: 9, fontSize: '0.75rem', fontWeight: 700, color: fp.length === 2 ? '#000' : '#666', fontFamily: 'Orbitron, sans-serif', cursor: fp.length === 2 ? 'pointer' : 'not-allowed', boxShadow: fp.length === 2 ? '0 0 15px rgba(255,200,0,0.4)' : 'none', animation: fp.length === 2 ? 'superGlow 2s infinite' : 'none' }}>🎲 SUPER</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {fp.length > 0 && history.length < 3 && (
                <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 20, width: '85%', maxWidth: 300 }}>
                  <div style={{ background: 'rgba(10,10,20,0.95)', border: '1px solid #555', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: '#888', marginBottom: 10 }}>あと{3 - history.length}体必要です</div>
                    <button onClick={() => setFp([])} style={{ background: '#333', border: 'none', borderRadius: 5, padding: '6px 16px', fontSize: '0.75rem', color: '#aaa', fontFamily: 'Rajdhani, sans-serif', cursor: 'pointer' }}>閉じる</button>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: '85%', maxWidth: 380 }}>
              <div style={{ background: 'rgba(10,10,20,0.95)', border: '1.5px solid #ff4444', borderRadius: 10, padding: 14, boxShadow: '0 0 25px rgba(255,0,0,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', color: '#ff4444' }}>⚔️ STAGE {stage} BATTLE</span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.6rem', color: fusionSt === 'ready' ? '#44ff44' : fusionSt === 'generating' ? '#ff00ff' : '#ff4444' }}>{fusionSt === 'generating' ? '⏳ 融合中...' : fusionSt === 'ready' ? '✅ 融合完了' : '❌ 失敗'}</span>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: '#aaa', marginBottom: 6 }}>▼ 参戦モンスターを選択</div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', minHeight: 28 }}>
                    {pp.length > 0 ? pp.map(idx => {
                      const s = genRef.current[idx]?.userData?.stats as CharacterStats
                      return s ? <div key={idx} style={{ padding: '4px 10px', background: 'rgba(0,255,255,0.1)', border: '1px solid #00ffff', borderRadius: 6, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.7rem' }}>{s.name}</div> : null
                    }) : (
                      <div style={{ padding: '4px 14px', border: '1px dashed #666', borderRadius: 6, fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: '#666' }}>残りのモンスターをクリック</div>
                    )}
                  </div>
                </div>
                <button onClick={() => { audioManager.playSE('button'); startBattle() }} disabled={pp.length === 0} style={{ width: '100%', background: pp.length > 0 ? 'linear-gradient(135deg, #ff4444, #cc0000)' : '#333', border: 'none', borderRadius: 5, padding: 9, fontSize: '0.8rem', fontWeight: 700, color: pp.length > 0 ? '#fff' : '#666', fontFamily: 'Orbitron, sans-serif', cursor: pp.length > 0 ? 'pointer' : 'not-allowed', boxShadow: pp.length > 0 ? '0 0 15px rgba(255,0,0,0.4)' : 'none' }}>⚔️ BATTLE START</button>
              </div>
            </div>
          )}

          {/* Character List */}
          {history.length > 0 && (
            <div style={{ position: 'absolute', right: 20, top: 15, zIndex: 10, width: 220 }}>
              <button onClick={() => setListOpen(p => !p)} style={{ width: '100%', background: 'rgba(10,10,20,0.9)', border: '1px solid #333', borderRadius: listOpen ? '8px 8px 0 0' : 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.75rem', color: '#00ffff', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.15em' }}>CHARS [{history.length}]</span>
                <span style={{ color: '#00ffff', fontSize: '0.8rem', transform: listOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
              </button>
              {listOpen && (
                <div style={{ background: 'rgba(10,10,20,0.85)', border: '1px solid #333', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: 12, maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                  {history.slice(-8).reverse().map(item => {
                    const s = item.stats || {}
                    const ec = EC[s.element as Element] || '#888'
                    return (
                      <div key={item.timestamp} style={{ padding: 8, marginBottom: 6, background: item.isSuper ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,100,0,0.1))' : item.isFusion ? 'linear-gradient(135deg, rgba(255,0,255,0.15), rgba(0,255,255,0.1))' : 'rgba(0,255,255,0.05)', borderLeft: `3px solid ${ec}`, borderRadius: '0 6px 6px 0', fontSize: '0.7rem', color: '#ccc', fontFamily: 'Rajdhani, sans-serif' }}>
                        {item.isSuper && <div style={{ fontSize: '0.55rem', color: '#ffd700', marginBottom: 3 }}>🎲 SUPER FUSION</div>}
                        {item.isFusion && !item.isSuper && <div style={{ fontSize: '0.55rem', color: '#ff00ff', marginBottom: 3 }}>⚡ FUSION</div>}
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>{s.name}</span><span style={{ color: '#ffd700', fontSize: '0.65rem' }}>{'★'.repeat(s.rarity || 1)}</span></div>
                        <div style={{ fontSize: '0.6rem', color: ec, marginTop: 2 }}>{EName[s.element as Element] || s.element}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, fontSize: '0.65rem', marginTop: 4 }}>
                          <div>HP:<span style={{ color: '#4f4' }}>{s.hp}</span></div><div>ATK:<span style={{ color: '#f44' }}>{s.attack}</span></div>
                          <div>DEF:<span style={{ color: '#48f' }}>{s.defense}</span></div><div>SPD:<span style={{ color: '#ff4' }}>{s.speed}</span></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Character Book */}
      {showBook && history.length > 0 && (
        <CharacterBook
          history={history}
          bookPage={bookPage}
          setBookPage={setBookPage}
          fusionSt={fusionSt}
        />
      )}

      {/* Battle Mode UI */}
      {mode === 'battle' && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto', background: 'linear-gradient(180deg, rgba(5,5,15,0.95) 75%, transparent)', padding: '20px 20px 35px' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', color: '#ffd700', letterSpacing: '0.15em', padding: '2px 8px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 4 }}>STAGE {stage}</div>
                {curBossRef.current && <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: '#ff4444' }}>vs {curBossRef.current.name}</div>}
              </div>
              <div style={{ maxHeight: 140, overflowY: 'auto', marginBottom: 10 }}>
                {bLog.map((msg, i) => {
                  const isL = i === bLog.length - 1
                  const isR = i >= bLog.length - 3
                  return (
                    <div key={i} style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: isL ? '1.15rem' : '0.95rem', fontWeight: isL ? 700 : 400, color: isL ? '#fff' : isR ? '#999' : '#555', padding: '4px 0', lineHeight: 1.5 }}>{msg}</div>
                  )
                })}
                <div ref={logEndRef} />
              </div>
              {bPhase === 'loading' && <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem', color: '#00ffff', textAlign: 'center', animation: 'pulse 0.8s infinite' }}>🔄 バトルシナリオ生成中...</div>}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          {(bPhase === 'done' || bPhase === 'lost') && (
            <div style={{ pointerEvents: 'auto', textAlign: 'center', padding: '10px 20px 30px', background: 'linear-gradient(0deg, rgba(5,5,15,0.9) 60%, transparent)' }}>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: bPhase === 'done' ? '#ffd700' : '#ff4444', animation: bPhase === 'done' ? 'victoryGlow 1s infinite' : 'none', textShadow: bPhase === 'lost' ? '0 0 20px #ff0000' : undefined, marginBottom: 6 }}>{bPhase === 'done' ? '🎉 VICTORY! 🎉' : '💀 DEFEAT... 💀'}</div>
              {bPhase === 'done' && <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.85rem', color: '#00ffff', marginBottom: 10 }}>▶ STAGE {stage + 1} が解放されます</div>}
              <button onClick={() => { audioManager.playSE('button'); endBattle(bPhase === 'done') }} style={{ background: bPhase === 'done' ? 'linear-gradient(135deg, #ffd700, #ff8800)' : 'linear-gradient(135deg, #666, #444)', border: 'none', borderRadius: 8, padding: '10px 30px', fontSize: '0.85rem', fontWeight: 700, color: bPhase === 'done' ? '#000' : '#fff', fontFamily: 'Orbitron, sans-serif', cursor: 'pointer', boxShadow: bPhase === 'done' ? '0 0 20px rgba(255,200,0,0.5)' : '0 0 15px rgba(255,0,0,0.3)' }}>{bPhase === 'done' ? `STAGE ${stage + 1} へ` : 'フィールドに戻る'}</button>
            </div>
          )}
          {bPhase === 'error' && (
            <div style={{ pointerEvents: 'auto', textAlign: 'center', padding: '10px 20px 30px', background: 'linear-gradient(0deg, rgba(5,5,15,0.9) 60%, transparent)' }}>
              <button onClick={() => { audioManager.playSE('button'); endBattle(false) }} style={{ background: '#444', border: 'none', borderRadius: 8, padding: '10px 30px', fontSize: '0.85rem', fontWeight: 700, color: '#fff', fontFamily: 'Orbitron, sans-serif', cursor: 'pointer' }}>フィールドに戻る</button>
            </div>
          )}
        </div>
      )}

      {/* Intro Modal */}
      {showIntro && <IntroModal onClose={() => setShowIntro(false)} />}

      {/* Settings Button */}
      <button
        onClick={() => { audioManager.playSE('button'); setShowSettings(true) }}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 50,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(30,30,50,0.85)',
          border: '1px solid #555',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          color: '#888',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#888'
          e.currentTarget.style.color = '#ccc'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#555'
          e.currentTarget.style.color = '#888'
        }}
      >
        ⚙
      </button>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}
