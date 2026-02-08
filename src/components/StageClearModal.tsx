'use client'

import { audioManager } from '@/lib/audio/audioManager'
import type { BossData } from '@/types/game'

interface StageClearModalProps {
  stage: number
  nextBoss: BossData
  onClose: () => void
}

export function StageClearModal({ stage, nextBoss, onClose }: StageClearModalProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={() => { audioManager.playSE('button'); onClose() }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          animation: 'stageClearPulse 1.5s ease-out forwards'
        }}
      >
        <div
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '1rem',
            color: '#00ffff',
            letterSpacing: '0.3em',
            marginBottom: 12,
            opacity: 0.8
          }}
        >
          STAGE {stage - 1}
        </div>
        <div
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '2.5rem',
            fontWeight: 900,
            color: '#ffd700',
            animation: 'stageGlow 2s infinite',
            letterSpacing: '0.1em',
            marginBottom: 20
          }}
        >
          CLEAR!
        </div>
        <div
          style={{
            width: 80,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #ffd700, transparent)',
            margin: '0 auto 24px',
            borderRadius: 2
          }}
        />
        <div
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '1.2rem',
            color: '#ff8800',
            marginBottom: 8
          }}
        >
          ▶ STAGE {stage} へ進む
        </div>
        {stage === 2 && (
          <div
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '0.85rem',
              color: '#ffd700',
              marginBottom: 10,
              padding: '6px 16px',
              background: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: 6,
              display: 'inline-block'
            }}
          >
            🎲 Super Fusion が解放されました！
          </div>
        )}
        <div
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '0.85rem',
            color: '#aaa',
            marginBottom: 6
          }}
        >
          次のボス: <span style={{ color: '#ff4444', fontWeight: 700 }}>{nextBoss.name}</span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '0.75rem',
            color: '#888'
          }}
        >
          <span>
            HP:<span style={{ color: '#4f4' }}>{nextBoss.hp}</span>
          </span>
          <span>
            ATK:<span style={{ color: '#f44' }}>{nextBoss.attack}</span>
          </span>
          <span>
            DEF:<span style={{ color: '#48f' }}>{nextBoss.defense}</span>
          </span>
        </div>
        <div
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '0.7rem',
            color: '#555',
            marginTop: 24
          }}
        >
          タップして続ける
        </div>
      </div>
    </div>
  )
}
