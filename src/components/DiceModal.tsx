'use client'

import { DiceFace } from './DiceFace'
import { audioManager } from '@/lib/audio/audioManager'
import type { DiceResult, DicePhase } from '@/types/game'

interface SparkParticle {
  id: number
  x: number
  y: number
  size: number
  color: string
}

interface DiceModalProps {
  dicePhase: DicePhase
  diceRolling: boolean
  diceValue: number
  diceResult: DiceResult | null
  diceRotX: number
  diceRotY: number
  diceScale: number
  sparks: SparkParticle[]
  onRollDice: () => void
  onCloseDice: () => void
  onProceed: () => void
}

export function DiceModal({
  dicePhase,
  diceRolling,
  diceValue,
  diceResult,
  diceRotX,
  diceRotY,
  diceScale,
  sparks,
  onRollDice,
  onCloseDice,
  onProceed
}: DiceModalProps) {
  const getGlowColor = () => {
    if (diceResult) {
      if (diceResult.outcome === 'fail') return '#ff4444'
      if (diceResult.outcome === 'super') return '#ffd700'
      return '#00ffff'
    }
    if (diceRolling) return '#ffaa00'
    if (dicePhase === 'idle') return '#ffd700'
    return '#888'
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15,10,35,0.98), rgba(30,15,50,0.98))',
          border: '1.5px solid #ffd700',
          borderRadius: 16,
          padding: '32px 36px',
          maxWidth: 340,
          width: '85%',
          textAlign: 'center',
          boxShadow: '0 0 60px rgba(255,215,0,0.15)'
        }}
      >
        <div
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.8rem',
            color: '#ffd700',
            letterSpacing: '0.2em',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>🎲 SUPER FUSION DICE</span>
          {dicePhase === 'idle' && (
            <button
              onClick={onCloseDice}
              style={{
                background: 'none',
                border: '1px solid #555',
                borderRadius: '50%',
                width: 24,
                height: 24,
                color: '#888',
                fontSize: '0.7rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Dice guide */}
        {(dicePhase === 'idle' || diceRolling) && !diceResult && (
          <>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
              {([
                [1, '💀', '#ff4444'],
                [2, '💀', '#ff4444'],
                [3, '—', '#888'],
                [4, '—', '#888'],
                [5, '⚡', '#ffd700'],
                [6, '⚡', '#ffd700']
              ] as const).map(([n, icon, c]) => (
                <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${c}44`,
                      borderRadius: 5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '0.7rem',
                      color: c,
                      fontWeight: 700
                    }}
                  >
                    {n}
                  </div>
                  <span style={{ fontSize: '0.6rem' }}>{icon}</span>
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 12,
                marginBottom: 16,
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '0.65rem'
              }}
            >
              <span style={{ color: '#ff4444' }}>💀 1-2 Fail</span>
              <span style={{ color: '#888' }}>— 3-4 Normal</span>
              <span style={{ color: '#ffd700' }}>⚡ 5-6 Stats ×1.5</span>
            </div>
          </>
        )}

        {/* Dice container */}
        <div
          style={{
            position: 'relative',
            width: 140,
            height: 140,
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Sparks */}
          {sparks.map(s => (
            <div
              key={s.id}
              style={{
                position: 'absolute',
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                borderRadius: '50%',
                background: s.color,
                boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
                transform: 'translate(-50%, -50%)',
                transition: 'opacity 0.3s',
                pointerEvents: 'none'
              }}
            />
          ))}

          {/* Glow ring */}
          <div
            style={{
              position: 'absolute',
              width: 130,
              height: 130,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${
                diceResult
                  ? diceResult.outcome === 'fail'
                    ? 'rgba(255,68,68,0.2)'
                    : diceResult.outcome === 'super'
                    ? 'rgba(255,215,0,0.25)'
                    : 'rgba(0,255,255,0.2)'
                  : 'rgba(255,215,0,0.1)'
              } 0%, transparent 70%)`,
              animation: diceRolling ? 'pulse 0.3s infinite' : 'none'
            }}
          />

          {/* Dice */}
          <div
            onClick={dicePhase === 'idle' ? () => { audioManager.playSE('button'); onRollDice() } : undefined}
            style={{
              cursor: dicePhase === 'idle' ? 'pointer' : 'default',
              animation: dicePhase === 'idle' ? 'diceIdle 3s ease-in-out infinite' : 'none',
              transform:
                dicePhase !== 'idle'
                  ? `perspective(400px) rotateX(${diceRotX}deg) rotateY(${diceRotY}deg) scale(${diceScale})`
                  : undefined,
              transition: dicePhase === 'done' ? 'transform 0.2s ease' : 'none',
              filter: diceRolling
                ? `brightness(${1 + Math.random() * 0.3}) drop-shadow(0 0 15px rgba(255,215,0,0.6))`
                : `drop-shadow(0 0 ${diceResult && diceResult.outcome === 'super' ? 20 : 10}px ${
                    diceResult
                      ? diceResult.outcome === 'fail'
                        ? 'rgba(255,68,68,0.5)'
                        : diceResult.outcome === 'super'
                        ? 'rgba(255,215,0,0.7)'
                        : 'rgba(0,255,255,0.5)'
                      : 'rgba(255,215,0,0.3)'
                  })`
            }}
          >
            <DiceFace value={diceValue} size={110} glowColor={getGlowColor()} />
          </div>
        </div>

        {/* Status text */}
        {dicePhase === 'idle' && !diceRolling && !diceResult && (
          <div
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '1.1rem',
              color: '#ffd700',
              animation: 'pulse 1.5s infinite'
            }}
          >
            🎲 サイコロをクリックして振る！
          </div>
        )}

        {diceRolling && (
          <div
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '1.1rem',
              color: dicePhase === 'slowing' ? '#ffaa00' : '#aaa',
              transition: 'color 0.3s'
            }}
          >
            {dicePhase === 'slowing' ? '止まりそう...' : 'ダイスを振っています...'}
          </div>
        )}

        {/* Result */}
        {diceResult && (
          <>
            {diceResult.outcome === 'fail' && (
              <div>
                <div
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    color: '#ff4444',
                    marginBottom: 8,
                    animation: 'failFlash 0.5s 3'
                  }}
                >
                  FAILED...
                </div>
                <div
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '0.85rem',
                    color: '#888',
                    marginBottom: 16
                  }}
                >
                  出目 {diceResult.value} — 融合失敗！先に選んだキャラで続行
                </div>
              </div>
            )}

            {diceResult.outcome === 'normal' && (
              <div>
                <div
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    color: '#00ffff',
                    marginBottom: 8
                  }}
                >
                  NORMAL
                </div>
                <div
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '0.85rem',
                    color: '#888',
                    marginBottom: 16
                  }}
                >
                  出目 {diceResult.value} — 通常融合と同じステータス
                </div>
              </div>
            )}

            {diceResult.outcome === 'super' && (
              <div>
                <div
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    color: '#ffd700',
                    marginBottom: 8,
                    animation: 'stageGlow 1s infinite',
                    textShadow: '0 0 20px #ffd700'
                  }}
                >
                  ✨ SUPER!! ✨
                </div>
                <div
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '0.85rem',
                    color: '#ffd700',
                    marginBottom: 16
                  }}
                >
                  出目 {diceResult.value} — ステータス1.5倍で融合！
                </div>
              </div>
            )}

            <button
              onClick={() => { audioManager.playSE('button'); onProceed() }}
              style={{
                background:
                  diceResult.outcome === 'fail'
                    ? 'linear-gradient(135deg, #666, #444)'
                    : diceResult.outcome === 'super'
                    ? 'linear-gradient(135deg, #ffd700, #ff8800)'
                    : 'linear-gradient(135deg, #00ffff, #00aaaa)',
                border: 'none',
                borderRadius: 8,
                padding: '10px 30px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: diceResult.outcome === 'fail' ? '#fff' : '#000',
                fontFamily: 'Orbitron, sans-serif',
                cursor: 'pointer',
                boxShadow:
                  diceResult.outcome === 'super'
                    ? '0 0 25px rgba(255,200,0,0.5)'
                    : '0 0 15px rgba(0,255,255,0.3)'
              }}
            >
              {diceResult.outcome === 'fail' ? '融合失敗…先へ進む' : '融合開始！'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
