/**
 * 音效管理系统
 * 提供游戏中各种音效播放功能
 */

export type SoundType = 'move' | 'capture' | 'check' | 'checkmate' | 'select' | 'invalid'

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

  constructor() {
    this.initAudioContext()
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