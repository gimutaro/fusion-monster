// Audio Manager for BGM and SE

type BGMType = 'field' | 'battle'
type SEType = 'hit' | 'lose' | 'win' | 'button' | 'ultrafusion_success' | 'ultrafusion_failure'

const BGM_PATHS: Record<BGMType, string> = {
  field: '/music/bgm/bgm_lab.mp3',
  battle: '/music/bgm/bgm_battle.mp3'
}

const SE_PATHS: Record<SEType, string> = {
  hit: '/music/se/se_hit.mp3',
  lose: '/music/se/se_lose.mp3',
  win: '/music/se/se_win.mp3',
  button: '/music/se/se_button.mp3',
  ultrafusion_success: '/music/se/se_ultrafusion_success.mp3',
  ultrafusion_failure: '/music/se/se_ultrafusion_failure.mp3'
}

class AudioManager {
  private bgmAudio: HTMLAudioElement | null = null
  private currentBGM: BGMType | null = null
  private sePool: Map<SEType, HTMLAudioElement[]> = new Map()
  private bgmVolume = 0.4
  private seVolume = 0.6
  private initialized = false

  init() {
    if (this.initialized || typeof window === 'undefined') return
    this.initialized = true

    // Pre-create SE audio pools for instant playback
    Object.entries(SE_PATHS).forEach(([key, path]) => {
      const pool: HTMLAudioElement[] = []
      for (let i = 0; i < 3; i++) {
        const audio = new Audio(path)
        audio.volume = this.seVolume
        audio.preload = 'auto'
        pool.push(audio)
      }
      this.sePool.set(key as SEType, pool)
    })
  }

  playBGM(type: BGMType) {
    if (typeof window === 'undefined') return
    this.init()

    if (this.currentBGM === type && this.bgmAudio && !this.bgmAudio.paused) {
      return
    }

    // Fade out current BGM
    if (this.bgmAudio) {
      const oldAudio = this.bgmAudio
      const fadeOut = () => {
        if (oldAudio.volume > 0.05) {
          oldAudio.volume = Math.max(0, oldAudio.volume - 0.05)
          requestAnimationFrame(fadeOut)
        } else {
          oldAudio.pause()
          oldAudio.currentTime = 0
        }
      }
      fadeOut()
    }

    // Start new BGM
    this.bgmAudio = new Audio(BGM_PATHS[type])
    this.bgmAudio.loop = true
    this.bgmAudio.volume = 0
    this.currentBGM = type

    const newAudio = this.bgmAudio
    const fadeIn = () => {
      if (newAudio.volume < this.bgmVolume - 0.05) {
        newAudio.volume = Math.min(this.bgmVolume, newAudio.volume + 0.02)
        requestAnimationFrame(fadeIn)
      } else {
        newAudio.volume = this.bgmVolume
      }
    }

    this.bgmAudio.play().then(fadeIn).catch(() => {
      // Autoplay blocked - will try again on user interaction
    })
  }

  stopBGM() {
    if (this.bgmAudio) {
      const audio = this.bgmAudio
      const fadeOut = () => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.05)
          requestAnimationFrame(fadeOut)
        } else {
          audio.pause()
          audio.currentTime = 0
        }
      }
      fadeOut()
      this.currentBGM = null
    }
  }

  playSE(type: SEType) {
    if (typeof window === 'undefined') return
    this.init()

    const pool = this.sePool.get(type)
    if (!pool) return

    // Find an available audio element from the pool
    const audio = pool.find(a => a.paused || a.ended) || pool[0]
    if (audio) {
      audio.currentTime = 0
      audio.volume = this.seVolume
      audio.play().catch(() => {
        // Ignore play errors
      })
    }
  }

  setBGMVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume))
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmVolume
    }
  }

  setSEVolume(volume: number) {
    this.seVolume = Math.max(0, Math.min(1, volume))
  }

  // Resume BGM after user interaction (for autoplay policy)
  resumeBGM() {
    if (this.bgmAudio && this.bgmAudio.paused && this.currentBGM) {
      this.bgmAudio.play().catch(() => {})
    }
  }
}

export const audioManager = new AudioManager()
