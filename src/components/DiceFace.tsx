'use client'

import { DICE_DOTS } from '@/lib/game/constants'

interface DiceFaceProps {
  value: number
  size?: number
  glowColor?: string
}

export function DiceFace({ value, size = 100, glowColor = '#fff' }: DiceFaceProps) {
  const dots = DICE_DOTS[value] || []
  const dotRadius = size * 0.09

  return (
    <div
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #1a1a2e, #2a2a4e)',
        borderRadius: size * 0.15,
        border: `2px solid ${glowColor}`,
        boxShadow: `0 0 20px ${glowColor}44, inset 0 0 15px rgba(0,0,0,0.5)`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {dots.map((dot, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${dot[0]}%`,
            top: `${dot[1]}%`,
            transform: 'translate(-50%, -50%)',
            width: dotRadius,
            height: dotRadius,
            borderRadius: '50%',
            background: glowColor,
            boxShadow: `0 0 8px ${glowColor}`
          }}
        />
      ))}
    </div>
  )
}
