'use client'

import { audioManager } from '@/lib/audio/audioManager'

interface IntroModalProps {
  onClose: () => void
}

export function IntroModal({ onClose }: IntroModalProps) {
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
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(10,10,30,0.98), rgba(20,10,40,0.98))',
          border: '1.5px solid #00ffff',
          borderRadius: 16,
          padding: '36px 32px 28px',
          maxWidth: 420,
          width: '85%',
          textAlign: 'center',
          boxShadow: '0 0 60px rgba(0,255,255,0.15), inset 0 0 30px rgba(0,255,255,0.05)'
        }}
      >
        <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>🧙‍♂️🐉</div>
        <h2
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '1.2rem',
            fontWeight: 900,
            color: '#00ffff',
            margin: '0 0 8px',
            letterSpacing: '0.1em',
            textShadow: '0 0 15px #00ffff'
          }}
        >
          Fusion Monsters
        </h2>
        <div
          style={{
            width: 60,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
            margin: '0 auto 20px',
            borderRadius: 2
          }}
        />
        <p
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '1.05rem',
            color: '#ccc',
            lineHeight: 1.7,
            margin: '0 0 24px',
            textAlign: 'left'
          }}
        >
          <span style={{ color: '#ff00ff', fontWeight: 700 }}>You are a mad wizard.</span>
          <br />
          You can <span style={{ color: '#00ffff', fontWeight: 700 }}>generate</span> and{' '}
          <span style={{ color: '#ff00ff', fontWeight: 700 }}>fuse</span> monsters to create chimeras.
          <br />
          <br />
          Now, enraged enemies are closing in.
          <br />
          Before they tear you apart, fuse your creatures—
          <br />
          and build the <span style={{ color: '#ffd700', fontWeight: 700 }}>strongest monster</span> you can.
        </p>
        <button
          onClick={() => { audioManager.playSE('button'); audioManager.playBGM('field'); onClose() }}
          style={{
            background: 'linear-gradient(135deg, #00ffff, #00aaaa)',
            border: 'none',
            borderRadius: 8,
            padding: '12px 40px',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#000',
            fontFamily: 'Orbitron, sans-serif',
            cursor: 'pointer',
            boxShadow: '0 0 25px rgba(0,255,255,0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 0 35px rgba(0,255,255,0.6)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 0 25px rgba(0,255,255,0.4)'
          }}
        >
          START
        </button>
      </div>
    </div>
  )
}
