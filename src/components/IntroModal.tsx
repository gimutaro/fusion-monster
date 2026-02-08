'use client'

import { useState, useEffect } from 'react'
import { audioManager } from '@/lib/audio/audioManager'

interface IntroModalProps {
  onClose: (apiKey: string) => void
}

const API_KEY_STORAGE_KEY = 'fusion-monster-api-key'

export function IntroModal({ onClose }: IntroModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')

  // Load saved API key from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (saved) {
      setApiKey(saved)
    }
  }, [])

  const handleStart = () => {
    if (!apiKey.trim()) {
      setError('Please enter your Anthropic API key')
      return
    }
    if (!apiKey.startsWith('sk-ant-')) {
      setError('Invalid API key format. It should start with "sk-ant-"')
      return
    }
    // Save to localStorage
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim())
    audioManager.playSE('button')
    audioManager.playBGM('field')
    onClose(apiKey.trim())
  }

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
          maxWidth: 480,
          width: '90%',
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
            margin: '0 0 20px',
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

        {/* API Key Input */}
        <div style={{ marginBottom: 20, textAlign: 'left' }}>
          <label
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.7rem',
              color: '#00ffff',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: 8
            }}
          >
            ANTHROPIC API KEY
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setError('') }}
              placeholder="sk-ant-api03-..."
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.5)',
                border: error ? '1px solid #ff4444' : '1px solid #333',
                borderRadius: 6,
                padding: '12px 45px 12px 14px',
                fontSize: '0.9rem',
                color: '#fff',
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#00ffff'}
              onBlur={e => e.target.style.borderColor = error ? '#ff4444' : '#333'}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: 4
              }}
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#ff4444', fontFamily: 'Rajdhani, sans-serif' }}>
              {error}
            </div>
          )}
          <div style={{ marginTop: 8, fontSize: '0.7rem', color: '#666', fontFamily: 'Rajdhani, sans-serif' }}>
            Get your API key from{' '}
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00aaaa', textDecoration: 'underline' }}
            >
              console.anthropic.com
            </a>
            <br />
            Your key is stored locally and never sent to our servers.
          </div>
        </div>

        <button
          onClick={handleStart}
          style={{
            background: apiKey.trim() ? 'linear-gradient(135deg, #00ffff, #00aaaa)' : '#333',
            border: 'none',
            borderRadius: 8,
            padding: '12px 40px',
            fontSize: '1rem',
            fontWeight: 700,
            color: apiKey.trim() ? '#000' : '#666',
            fontFamily: 'Orbitron, sans-serif',
            cursor: apiKey.trim() ? 'pointer' : 'not-allowed',
            boxShadow: apiKey.trim() ? '0 0 25px rgba(0,255,255,0.4)' : 'none',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={e => {
            if (apiKey.trim()) {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 0 35px rgba(0,255,255,0.6)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = apiKey.trim() ? '0 0 25px rgba(0,255,255,0.4)' : 'none'
          }}
        >
          START
        </button>
      </div>
    </div>
  )
}
