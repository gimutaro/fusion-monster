'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { buildObj, adjustGround, removeFloatingParts } from '@/lib/three/builder'
import { EC, EName } from '@/lib/game/constants'
import type { HistoryItem, Element } from '@/types/game'

interface CharacterBookProps {
  history: HistoryItem[]
  bookPage: number
  setBookPage: (fn: (p: number) => number) => void
  fusionSt: string | null
}

export function CharacterBook({ history, bookPage, setBookPage, fusionSt }: CharacterBookProps) {
  const bookCanvasRef = useRef<HTMLCanvasElement>(null)
  const bookRenRef = useRef<THREE.WebGLRenderer | null>(null)
  const bookAnimRef = useRef<number | null>(null)
  const bookDragRef = useRef({ dragging: false, lastX: 0, lastY: 0, rotY: 0, rotX: 0, zoom: 8 })

  useEffect(() => {
    if (bookAnimRef.current) {
      cancelAnimationFrame(bookAnimRef.current)
      bookAnimRef.current = null
    }
    if (bookRenRef.current) {
      bookRenRef.current.dispose()
      bookRenRef.current = null
    }
    if (!bookCanvasRef.current || history.length === 0) return

    const item = history[bookPage]
    if (!item || !item.modelDef) return

    const W = 240, H = 280
    const bd = bookDragRef.current
    bd.rotY = 0
    bd.rotX = 0
    bd.zoom = 8
    bd.dragging = false

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x2a2218)

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    const renderer = new THREE.WebGLRenderer({ canvas: bookCanvasRef.current, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(2)
    bookRenRef.current = renderer

    scene.add(new THREE.AmbientLight(0xffeedd, 0.7))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9)
    dirLight.position.set(5, 10, 5)
    scene.add(dirLight)
    const pointLight = new THREE.PointLight(0xff8844, 0.4, 20)
    pointLight.position.set(-3, 5, 3)
    scene.add(pointLight)

    const charObj = buildObj(item.modelDef)
    let centerY = 0

    if (charObj) {
      removeFloatingParts(charObj)
      adjustGround(charObj)
      const box = new THREE.Box3().setFromObject(charObj)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      if (maxDim > 0) {
        const scale = 3.2 / maxDim
        charObj.scale.multiplyScalar(scale)
      }
      const box2 = new THREE.Box3().setFromObject(charObj)
      const center = box2.getCenter(new THREE.Vector3())
      charObj.position.sub(center)
      centerY = 0
      scene.add(charObj)
    }

    camera.position.set(0, centerY, bd.zoom)
    camera.lookAt(0, centerY, 0)

    const canvas = bookCanvasRef.current

    const onDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      bd.dragging = true
      const t = 'touches' in e ? e.touches[0] : e
      bd.lastX = t.clientX
      bd.lastY = t.clientY
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!bd.dragging) return
      e.preventDefault()
      const t = 'touches' in e ? e.touches[0] : e
      const dx = t.clientX - bd.lastX
      const dy = t.clientY - bd.lastY
      bd.lastX = t.clientX
      bd.lastY = t.clientY
      bd.rotY += dx * 0.01
      bd.rotX += dy * 0.01
      bd.rotX = Math.max(-1.2, Math.min(1.2, bd.rotX))
      if (charObj) {
        charObj.rotation.y = bd.rotY
        charObj.rotation.x = bd.rotX
      }
    }

    const onUp = () => {
      bd.dragging = false
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      bd.zoom = Math.max(3, Math.min(15, bd.zoom + e.deltaY * 0.01))
      camera.position.set(0, centerY, bd.zoom)
      camera.lookAt(0, centerY, 0)
    }

    let lastTouchDist = 0
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (lastTouchDist > 0) {
          const delta = (lastTouchDist - dist) * 0.05
          bd.zoom = Math.max(3, Math.min(15, bd.zoom + delta))
          camera.position.set(0, centerY, bd.zoom)
          camera.lookAt(0, centerY, 0)
        }
        lastTouchDist = dist
      } else {
        onMove(e)
      }
    }

    const onTouchEnd = () => {
      bd.dragging = false
      lastTouchDist = 0
    }

    canvas.addEventListener('mousedown', onDown as EventListener)
    canvas.addEventListener('mousemove', onMove as EventListener)
    window.addEventListener('mouseup', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onDown as EventListener, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)

    const animate = () => {
      bookAnimRef.current = requestAnimationFrame(animate)
      if (charObj) {
        const t = Date.now() * 0.003
        const ws = 1.2
        charObj.traverse(c => {
          const p = c.userData.part
          if (!p) return
          if (p === 'leg_fl' || p === 'leg_br') c.rotation.x = Math.sin(t * ws) * 0.35
          else if (p === 'leg_fr' || p === 'leg_bl') c.rotation.x = Math.sin(t * ws + Math.PI) * 0.35
          else if (p === 'arm_l') { c.rotation.x = Math.sin(t * ws) * 0.25; c.rotation.z = c.userData.baseRotationZ ?? -0.2 }
          else if (p === 'arm_r') { c.rotation.x = Math.sin(t * ws + Math.PI) * 0.25; c.rotation.z = c.userData.baseRotationZ ?? 0.2 }
          else if (p === 'wing_l') c.rotation.z = 0.15 + Math.sin(t * 2) * 0.3
          else if (p === 'wing_r') c.rotation.z = -0.15 - Math.sin(t * 2) * 0.3
          else if (p === 'tail') c.rotation.y = Math.sin(t * 1.5) * 0.3
          else if (p === 'head') c.rotation.x = Math.sin(t * ws * 0.5) * 0.04
        })
      }
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      if (bookAnimRef.current) cancelAnimationFrame(bookAnimRef.current)
      if (bookRenRef.current) {
        bookRenRef.current.dispose()
        bookRenRef.current = null
      }
      canvas.removeEventListener('mousedown', onDown as EventListener)
      canvas.removeEventListener('mousemove', onMove as EventListener)
      window.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onDown as EventListener)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      scene.traverse(c => {
        if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose()
        if ((c as THREE.Mesh).material) {
          const mat = (c as THREE.Mesh).material
          if (Array.isArray(mat)) mat.forEach(m => m.dispose())
          else (mat as THREE.Material).dispose()
        }
      })
    }
  }, [bookPage, history])

  const item = history[bookPage] || history[0]
  const s = item?.stats || {}
  const ec = EC[s.element as Element] || '#888'
  const mxS = Math.max(s.hp || 1, 300)

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)', pointerEvents: 'auto' }}>
      <div style={{ position: 'relative', maxWidth: 560, width: '94%', aspectRatio: '1.6/1', display: 'flex', filter: 'drop-shadow(0 8px 40px rgba(60,40,10,0.5))' }}>
        {/* Book spine */}
        <div style={{ position: 'absolute', left: '50%', top: -4, bottom: -4, width: 10, transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#1a1008,#4a3520,#6b4c2a,#4a3520,#1a1008)', borderRadius: 3, zIndex: 5, boxShadow: '0 0 10px rgba(0,0,0,0.6)' }} />

        {/* Left page - character */}
        <div style={{ flex: '1.05', background: 'linear-gradient(135deg,#f7ead0,#eedcb8,#f2e4c8)', borderRadius: '10px 0 0 10px', border: '3px solid #8b6914', borderRight: 'none', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'grab', paddingRight: 10 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 80% 20%,rgba(255,255,240,0.3),transparent 60%),radial-gradient(ellipse at 20% 80%,rgba(139,105,20,0.05),transparent 50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 8, left: 8, right: 2, bottom: 8, border: '1px solid rgba(139,105,20,0.15)', borderRadius: 4, pointerEvents: 'none' }} />
          <canvas ref={bookCanvasRef} style={{ width: 240, height: '80%', borderRadius: 4, position: 'relative', zIndex: 1 }} />
          <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: '0.4rem', color: '#b09060', marginTop: 2, position: 'relative', zIndex: 1, letterSpacing: '0.05em' }}>drag to rotate · scroll to zoom</div>
          {bookPage > 0 && (
            <div onClick={() => setBookPage(p => Math.max(0, p - 1))} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '18%', cursor: 'pointer', background: 'linear-gradient(90deg,rgba(139,105,20,0.08),transparent)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(90deg,rgba(139,105,20,0.2),transparent)'} onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(90deg,rgba(139,105,20,0.08),transparent)'}>
              <span style={{ color: '#8b6914', fontSize: '1.2rem', opacity: 0.6, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>‹</span>
            </div>
          )}
        </div>

        {/* Right page - details */}
        <div style={{ flex: '0.95', background: 'linear-gradient(135deg,#f2e4c8,#eedcb8,#f7ead0)', borderRadius: '0 10px 10px 0', border: '3px solid #8b6914', borderLeft: 'none', position: 'relative', overflow: 'hidden', padding: '18px 14px 14px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 20% 20%,rgba(255,255,240,0.3),transparent 60%),radial-gradient(ellipse at 80% 80%,rgba(139,105,20,0.05),transparent 50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 8, left: 2, right: 8, bottom: 8, border: '1px solid rgba(139,105,20,0.15)', borderRadius: 4, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#2a1c0e', marginBottom: 1, lineHeight: 1.2 }}>{s.name || '???'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: '0.8rem', color: ec, fontWeight: 700 }}>{EName[s.element as Element] || '?'}</span>
              <span style={{ fontSize: '0.6rem', color: '#8b6914' }}>{'★'.repeat(s.rarity || 1)}{'☆'.repeat(5 - (s.rarity || 1))}</span>
            </div>
            {item?.isFusion && <div style={{ fontSize: '0.48rem', color: '#8b4513', background: 'rgba(139,69,19,0.08)', padding: '2px 6px', borderRadius: 3, marginBottom: 4, display: 'inline-block', border: '1px solid rgba(139,69,19,0.15)', alignSelf: 'flex-start' }}>{item.isSuper ? '🎲 SUPER FUSION' : '⚡ FUSION'}</div>}
            <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg,#c4a46a,transparent)', margin: '4px 0 6px' }} />
            {s.trait && <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: '0.65rem', color: '#5a4428', lineHeight: 1.8, marginBottom: 6, fontWeight: 500, letterSpacing: '0.02em' }}>{s.trait}</div>}
            <div style={{ flex: 1 }}>
              {([['HP', s.hp, '#44aa44'], ['ATK', s.attack, '#cc4444'], ['DEF', s.defense, '#4488cc'], ['SPD', s.speed, '#ccaa44']] as const).map(([lb, vl, cl]) => (
                <div key={lb} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Rajdhani,sans-serif', fontSize: '0.65rem', color: '#5a4420', marginBottom: 2 }}>
                    <span style={{ fontWeight: 600 }}>{lb}</span><span style={{ fontWeight: 700, color: '#2a1c0e' }}>{vl || 0}</span>
                  </div>
                  <div style={{ height: 7, background: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, ((vl || 0) / mxS) * 100)}%`, background: `linear-gradient(90deg,${cl},${cl}aa)`, borderRadius: 3, transition: 'width 0.5s', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: '0.45rem', color: '#a08050', fontStyle: 'italic', textAlign: 'right' }}>No.{String(bookPage + 1).padStart(3, '0')}</div>
          </div>
          {bookPage < history.length - 1 && (
            <div onClick={() => setBookPage(p => Math.min(history.length - 1, p + 1))} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '18%', cursor: 'pointer', background: 'linear-gradient(270deg,rgba(139,105,20,0.08),transparent)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(270deg,rgba(139,105,20,0.2),transparent)'} onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(270deg,rgba(139,105,20,0.08),transparent)'}>
              <span style={{ color: '#8b6914', fontSize: '1.2rem', opacity: 0.6, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>›</span>
            </div>
          )}
        </div>

        {/* Page nav buttons */}
        <div style={{ position: 'absolute', bottom: -36, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setBookPage(p => Math.max(0, p - 1))} disabled={bookPage === 0} style={{ background: bookPage > 0 ? 'rgba(139,105,20,0.2)' : 'transparent', border: `1px solid ${bookPage > 0 ? '#8b6914' : '#44341a'}`, borderRadius: 6, padding: '4px 14px', color: bookPage > 0 ? '#d4a44a' : '#44341a', fontFamily: 'Rajdhani,sans-serif', fontSize: '0.7rem', fontWeight: 600, cursor: bookPage > 0 ? 'pointer' : 'default', transition: 'all 0.2s', letterSpacing: '0.05em' }}>◀ Prev</button>
          <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: '0.6rem', color: 'rgba(212,164,74,0.6)', letterSpacing: '0.1em', minWidth: 50, textAlign: 'center' }}>{bookPage + 1} / {history.length}</span>
          <button onClick={() => setBookPage(p => Math.min(history.length - 1, p + 1))} disabled={bookPage >= history.length - 1} style={{ background: bookPage < history.length - 1 ? 'rgba(139,105,20,0.2)' : 'transparent', border: `1px solid ${bookPage < history.length - 1 ? '#8b6914' : '#44341a'}`, borderRadius: 6, padding: '4px 14px', color: bookPage < history.length - 1 ? '#d4a44a' : '#44341a', fontFamily: 'Rajdhani,sans-serif', fontSize: '0.7rem', fontWeight: 600, cursor: bookPage < history.length - 1 ? 'pointer' : 'default', transition: 'all 0.2s', letterSpacing: '0.05em' }}>Next ▶</button>
        </div>

        {/* Loading status */}
        <div style={{ position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
          <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: '0.8rem', color: 'rgba(200,180,140,0.7)', letterSpacing: '0.08em', animation: 'pulse 1.5s infinite' }}>
            {fusionSt === 'generating' ? 'Generating fusion...' : fusionSt === 'ready' ? 'Generating battle sequence...' : 'Preparing...'}
          </span>
        </div>
      </div>
    </div>
  )
}
