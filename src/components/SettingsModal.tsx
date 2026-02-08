'use client'

import { useState, useEffect } from 'react'
import { audioManager } from '@/lib/audio/audioManager'

interface SettingsModalProps {
  onClose: () => void
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [bgmVolume, setBgmVolume] = useState(40)
  const [seVolume, setSeVolume] = useState(60)

  useEffect(() => {
    audioManager.setBGMVolume(bgmVolume / 100)
  }, [bgmVolume])

  useEffect(() => {
    audioManager.setSEVolume(seVolume / 100)
  }, [seVolume])

  const handleTestSE = () => {
    audioManager.playSE('button')
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
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15,15,30,0.98), rgba(25,20,45,0.98))',
          border: '1.5px solid #666',
          borderRadius: 12,
          padding: '24px 28px',
          maxWidth: 320,
          width: '85%',
          boxShadow: '0 0 40px rgba(0,0,0,0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}
        >
          <span
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.85rem',
              color: '#aaa',
              letterSpacing: '0.15em'
            }}
          >
            SETTINGS
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid #555',
              borderRadius: '50%',
              width: 28,
              height: 28,
              color: '#888',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* BGM Volume */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}
          >
            <span
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '0.85rem',
                color: '#ccc',
                fontWeight: 600
              }}
            >
              BGM
            </span>
            <span
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.7rem',
                color: '#00ffff',
                minWidth: 36,
                textAlign: 'right'
              }}
            >
              {bgmVolume}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={bgmVolume}
            onChange={e => setBgmVolume(Number(e.target.value))}
            style={{
              width: '100%',
              height: 6,
              borderRadius: 3,
              background: `linear-gradient(90deg, #00ffff ${bgmVolume}%, #333 ${bgmVolume}%)`,
              appearance: 'none',
              cursor: 'pointer',
              outline: 'none'
            }}
          />
        </div>

        {/* SE Volume */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}
          >
            <span
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '0.85rem',
                color: '#ccc',
                fontWeight: 600
              }}
            >
              SE
            </span>
            <span
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.7rem',
                color: '#ff00ff',
                minWidth: 36,
                textAlign: 'right'
              }}
            >
              {seVolume}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={seVolume}
            onChange={e => setSeVolume(Number(e.target.value))}
            style={{
              width: '100%',
              height: 6,
              borderRadius: 3,
              background: `linear-gradient(90deg, #ff00ff ${seVolume}%, #333 ${seVolume}%)`,
              appearance: 'none',
              cursor: 'pointer',
              outline: 'none'
            }}
          />
        </div>

        {/* Test SE button */}
        <button
          onClick={handleTestSE}
          style={{
            width: '100%',
            marginTop: 12,
            background: 'rgba(255,0,255,0.1)',
            border: '1px solid #ff00ff44',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: '0.75rem',
            color: '#ff00ff',
            fontFamily: 'Rajdhani, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,0,255,0.2)'
            e.currentTarget.style.borderColor = '#ff00ff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,0,255,0.1)'
            e.currentTarget.style.borderColor = '#ff00ff44'
          }}
        >
          SE Test
        </button>
      </div>
    </div>
  )
}
