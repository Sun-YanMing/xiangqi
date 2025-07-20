/**
 * 音效管理系统
 * 提供游戏中各种音效播放功能
 */

export type SoundType = 'move' | 'capture' | 'check' | 'checkmate' | 'select' | 'invalid'
export type BackgroundMusicType = 'game' | 'menu'

/**
 * 背景音乐配置
 */
const BACKGROUND_MUSIC_CONFIG = {
  game: {
    src: '/bg-yinyue.mp4',
    volume: 0.3,
    loop: true
  },
  menu: {
    src: '/bg-yinyue.mp4',
    volume: 0.2,
    loop: true
  }
}

/**
 * 音效配置
 */
const SOUND_CONFIG = {
  move: {
    // 移动音效使用 Web Audio API 生成
    frequency: 800,
    duration: 0.1,
    type: 'sine' as OscillatorType
  },
  capture: {
    // 吃子音效
    frequency: 400,
    duration: 0.2,
    type: 'square' as OscillatorType
  },
  check: {
    // 将军音效
    frequency: 1200,
    duration: 0.3,
    type: 'triangle' as OscillatorType
  },
  checkmate: {
    // 将死音效
    frequency: 600,
    duration: 0.5,
    type: 'sawtooth' as OscillatorType
  },
  select: {
    // 选择棋子音效
    frequency: 1000,
    duration: 0.05,
    type: 'sine' as OscillatorType
  },
  invalid: {
    // 无效移动音效
    frequency: 200,
    duration: 0.1,
    type: 'sawtooth' as OscillatorType
  }
}

class SoundManager {
  private audioContext: AudioContext | null = null
  private isEnabled = true
  private backgroundMusic: HTMLAudioElement | null = null
  private backgroundMusicEnabled = true
  private currentBackgroundMusic: BackgroundMusicType | null = null

  constructor() {
    this.initAudioContext()
    this.initBackgroundMusic()
  }

  /**
   * 初始化音频上下文
   */
  private initAudioContext(): void {
    try {
      // @ts-expect-error - WebKit音频上下文的类型定义
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (error) {
      console.warn('Web Audio API 不支持，音效将被禁用', error)
      this.isEnabled = false
    }
  }

  /**
   * 初始化背景音乐
   */
  private initBackgroundMusic(): void {
    try {
      this.backgroundMusic = new Audio()
      this.backgroundMusic.preload = 'auto'
      
      // 错误处理
      this.backgroundMusic.addEventListener('error', (e) => {
        console.warn('背景音乐加载失败:', e)
        this.backgroundMusicEnabled = false
      })
      
      // 加载完成事件
      this.backgroundMusic.addEventListener('canplaythrough', () => {
        console.log('背景音乐已准备就绪')
      })
      
    } catch (error) {
      console.warn('背景音乐初始化失败:', error)
      this.backgroundMusicEnabled = false
    }
  }

  /**
   * 恢复音频上下文（用户交互后）
   */
  private async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  /**
   * 播放音效
   */
  async playSound(type: SoundType): Promise<void> {
    if (!this.isEnabled || !this.audioContext) return

    try {
      await this.resumeAudioContext()
      
      const config = SOUND_CONFIG[type]
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      // 配置振荡器
      oscillator.type = config.type
      oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime)

      // 配置音量包络
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + config.duration)

      // 连接节点
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // 播放音效
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + config.duration)

    } catch (error) {
      console.warn('播放音效失败:', error)
    }
  }

  /**
   * 播放复合音效（如将军时的警告音）
   */
  async playCheckSound(): Promise<void> {
    if (!this.isEnabled || !this.audioContext) return

    try {
      await this.resumeAudioContext()

      // 播放三个递增音调
      const frequencies = [800, 1000, 1200]
      for (let i = 0; i < frequencies.length; i++) {
        setTimeout(() => {
          this.createBeep(frequencies[i], 0.1)
        }, i * 100)
      }

    } catch (error) {
      console.warn('播放将军音效失败:', error)
    }
  }

  /**
   * 播放胜利音效
   */
  async playVictorySound(): Promise<void> {
    if (!this.isEnabled || !this.audioContext) return

    try {
      await this.resumeAudioContext()

      // 播放胜利旋律
      const melody = [
        { freq: 523, duration: 0.2 }, // C
        { freq: 659, duration: 0.2 }, // E
        { freq: 784, duration: 0.2 }, // G
        { freq: 1047, duration: 0.4 } // C
      ]

      melody.forEach((note, index) => {
        setTimeout(() => {
          this.createBeep(note.freq, note.duration)
        }, index * 200)
      })

    } catch (error) {
      console.warn('播放胜利音效失败:', error)
    }
  }

  /**
   * 创建单个音调
   */
  private createBeep(frequency: number, duration: number): void {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  /**
   * 启用/禁用音效
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  /**
   * 获取音效状态
   */
  isAudioEnabled(): boolean {
    return this.isEnabled
  }

  /**
   * 播放背景音乐
   */
  async playBackgroundMusic(type: BackgroundMusicType): Promise<void> {
    if (!this.backgroundMusicEnabled || !this.backgroundMusic) {
      console.warn('背景音乐不可用或已禁用')
      return
    }

    try {
      // 如果已经在播放相同的音乐，就不重复播放
      if (this.currentBackgroundMusic === type && !this.backgroundMusic.paused) {
        console.log(`背景音乐 ${type} 已在播放中`)
        return
      }

      // 停止当前播放的音乐
      if (this.backgroundMusic && !this.backgroundMusic.paused) {
        this.backgroundMusic.pause()
        this.backgroundMusic.currentTime = 0
      }

      const config = BACKGROUND_MUSIC_CONFIG[type]
      this.backgroundMusic.src = config.src
      this.backgroundMusic.volume = config.volume
      this.backgroundMusic.loop = config.loop
      
      // 添加音频事件监听器
      this.backgroundMusic.addEventListener('loadstart', () => {
        console.log(`开始加载背景音乐: ${type}`)
      })
      
      this.backgroundMusic.addEventListener('canplay', () => {
        console.log(`背景音乐 ${type} 可以播放`)
      })
      
      this.backgroundMusic.addEventListener('ended', () => {
        console.log(`背景音乐 ${type} 播放结束`)
        if (config.loop) {
          this.backgroundMusic?.play().catch(e => console.warn('重播背景音乐失败:', e))
        }
      })
      
      await this.backgroundMusic.play()
      this.currentBackgroundMusic = type
      
      console.log(`🎵 背景音乐开始播放: ${type} (音量: ${config.volume}, 循环: ${config.loop})`)
      
    } catch (error) {
      console.warn('播放背景音乐失败:', error)
      // 如果是因为用户未交互导致的失败，给出友好提示
      if (error instanceof Error && error.name === 'NotAllowedError') {
        console.log('💡 提示: 背景音乐需要用户交互后才能播放，请点击游戏界面任意位置')
      }
    }
  }

  /**
   * 停止背景音乐
   */
  stopBackgroundMusic(): void {
    if (this.backgroundMusic && !this.backgroundMusic.paused) {
      this.backgroundMusic.pause()
      this.backgroundMusic.currentTime = 0
      console.log('背景音乐已停止')
    }
    // 注意：不清除 currentBackgroundMusic，保留音乐类型信息
  }

  /**
   * 暂停背景音乐
   */
  pauseBackgroundMusic(): void {
    if (this.backgroundMusic && !this.backgroundMusic.paused) {
      this.backgroundMusic.pause()
      console.log('背景音乐已暂停')
    }
  }

  /**
   * 恢复背景音乐
   */
  resumeBackgroundMusic(): void {
    if (this.backgroundMusic && this.backgroundMusic.paused && this.currentBackgroundMusic) {
      this.backgroundMusic.play().catch(error => {
        console.warn('恢复背景音乐失败:', error)
      })
      console.log('背景音乐已恢复')
    }
  }

  /**
   * 设置背景音乐音量
   */
  setBackgroundMusicVolume(volume: number): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = Math.max(0, Math.min(1, volume))
    }
  }

  /**
   * 启用/禁用背景音乐
   */
  setBackgroundMusicEnabled(enabled: boolean): void {
    this.backgroundMusicEnabled = enabled
    if (!enabled) {
      this.stopBackgroundMusic()
    } else {
      // 重新启用时，自动播放游戏背景音乐
      setTimeout(() => {
        this.playBackgroundMusic('game').catch(error => {
          console.warn('重新启用背景音乐失败:', error)
        })
      }, 100) // 短暂延迟确保状态更新完成
    }
  }

  /**
   * 获取背景音乐启用状态
   */
  isBackgroundMusicEnabled(): boolean {
    return this.backgroundMusicEnabled
  }

  /**
   * 获取当前播放的背景音乐类型
   */
  getCurrentBackgroundMusic(): BackgroundMusicType | null {
    return this.currentBackgroundMusic
  }
}

// 创建全局音效管理器实例
export const soundManager = new SoundManager()

/**
 * 播放音效的便捷函数
 */
export const playSound = (type: SoundType): void => {
  soundManager.playSound(type)
}

/**
 * 播放将军音效
 */
export const playCheckSound = (): void => {
  soundManager.playCheckSound()
}

/**
 * 播放胜利音效
 */
export const playVictorySound = (): void => {
  soundManager.playVictorySound()
}

/**
 * 播放背景音乐
 */
export const playBackgroundMusic = (type: BackgroundMusicType): void => {
  soundManager.playBackgroundMusic(type)
}

/**
 * 停止背景音乐
 */
export const stopBackgroundMusic = (): void => {
  soundManager.stopBackgroundMusic()
}

/**
 * 暂停背景音乐
 */
export const pauseBackgroundMusic = (): void => {
  soundManager.pauseBackgroundMusic()
}

/**
 * 恢复背景音乐
 */
export const resumeBackgroundMusic = (): void => {
  soundManager.resumeBackgroundMusic()
}