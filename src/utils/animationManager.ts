import type { Position } from '../types/chess'

/**
 * 动画管理器
 * 处理棋子移动、吃子等动画效果
 */

export type AnimationType = 'move' | 'capture' | 'select' | 'deselect'

interface AnimationConfig {
  duration: number
  easing: string
  delay?: number
}

const ANIMATION_CONFIGS: Record<AnimationType, AnimationConfig> = {
  move: {
    duration: 400,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    delay: 0
  },
  capture: {
    duration: 350,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay: 100
  },
  select: {
    duration: 150,
    easing: 'ease-out',
    delay: 0
  },
  deselect: {
    duration: 100,
    easing: 'ease-in',
    delay: 0
  }
}

class AnimationManager {
  private animatingPieces = new Set<string>()
  private animationPromises = new Map<string, Promise<void>>()

  /**
   * 播放棋子移动动画
   */
  async animatePieceMove(
    pieceId: string,
    fromPosition: Position,
    toPosition: Position,
    isCapture = false
  ): Promise<void> {
    if (this.animatingPieces.has(pieceId)) {
      await this.animationPromises.get(pieceId)
    }

    const pieceElement = this.getPieceElement(pieceId)
    if (!pieceElement) return

    this.animatingPieces.add(pieceId)

    const animationPromise = this.performMoveAnimation(
      pieceElement,
      fromPosition,
      toPosition,
      isCapture
    )

    this.animationPromises.set(pieceId, animationPromise)

    try {
      await animationPromise
    } finally {
      this.animatingPieces.delete(pieceId)
      this.animationPromises.delete(pieceId)
    }
  }

  /**
   * 播放棋子被吃动画
   */
  async animatePieceCapture(pieceId: string): Promise<void> {
    const pieceElement = this.getPieceElement(pieceId)
    if (!pieceElement) {
      console.warn(`找不到棋子DOM元素: ${pieceId}`)
      return
    }

    const config = ANIMATION_CONFIGS.capture

    return new Promise((resolve) => {
      // 添加动画类名
      pieceElement.classList.add('piece-captured')
      
      // 设置动画样式（双重保险）
      ;(pieceElement as HTMLElement).style.animation = `pieceCapture ${config.duration}ms ${config.easing} forwards`
      
      const handleAnimationEnd = () => {
        pieceElement.removeEventListener('animationend', handleAnimationEnd)
        // 动画结束后清理类名
        pieceElement.classList.remove('piece-captured')
        resolve()
      }

      pieceElement.addEventListener('animationend', handleAnimationEnd)
      
      // 备用超时机制，确保Promise总会resolve
      setTimeout(() => {
        pieceElement.removeEventListener('animationend', handleAnimationEnd)
        pieceElement.classList.remove('piece-captured')
        resolve()
      }, config.duration + 100)
    })
  }

  /**
   * 播放棋子选中动画
   */
  animatePieceSelect(pieceId: string): void {
    const pieceElement = this.getPieceElement(pieceId)
    if (!pieceElement) return

    pieceElement.classList.add('piece-selected')
    
    // 添加选中脉冲效果
    const glowElement = pieceElement.querySelector('.piece-glow')
    if (glowElement) {
      glowElement.classList.add('piece-glow-pulse')
    }
  }

  /**
   * 移除棋子选中动画
   */
  animatePieceDeselect(pieceId: string): void {
    const pieceElement = this.getPieceElement(pieceId)
    if (!pieceElement) return

    pieceElement.classList.remove('piece-selected')
    
    const glowElement = pieceElement.querySelector('.piece-glow')
    if (glowElement) {
      glowElement.classList.remove('piece-glow-pulse')
    }
  }

  /**
   * 播放棋格高亮动画
   */
  animateSquareHighlight(row: number, col: number, type: 'valid' | 'selected'): void {
    const squareElement = this.getSquareElement(row, col)
    if (!squareElement) return

    squareElement.classList.add(type === 'valid' ? 'valid-move' : 'selected')
  }

  /**
   * 移除棋格高亮
   */
  removeSquareHighlight(row: number, col: number): void {
    const squareElement = this.getSquareElement(row, col)
    if (!squareElement) return

    squareElement.classList.remove('valid-move', 'selected')
  }

  /**
   * 清除所有高亮
   */
  clearAllHighlights(): void {
    const squares = document.querySelectorAll('.chess-square')
    squares.forEach(square => {
      square.classList.remove('valid-move', 'selected')
    })
  }

  /**
   * 播放将军警告动画
   */
  animateCheckWarning(): void {
    const boardElement = document.querySelector('.chess-board-container')
    if (!boardElement) return

    boardElement.classList.add('board-check-warning')
    
    setTimeout(() => {
      boardElement.classList.remove('board-check-warning')
    }, 1500)
  }

  /**
   * 播放胜利庆祝动画
   */
  animateVictory(winnerColor: 'red' | 'black'): void {
    const boardElement = document.querySelector('.chess-board-container')
    if (!boardElement) return

    boardElement.classList.add('board-victory', `victory-${winnerColor}`)
    
    // 让获胜方棋子闪烁
    const winnerPieces = document.querySelectorAll(`.piece-${winnerColor}`)
    winnerPieces.forEach((piece, index) => {
      setTimeout(() => {
        piece.classList.add('piece-victory-glow')
      }, index * 100)
    })
  }

  /**
   * 执行移动动画的核心逻辑
   */
  private async performMoveAnimation(
    pieceElement: Element,
    _fromPosition: Position,
    _toPosition: Position,
    isCapture: boolean
  ): Promise<void> {
    const config = ANIMATION_CONFIGS.move

    return new Promise((resolve) => {
      // 添加移动动画类
      pieceElement.classList.add('piece-moving')
      
      // 设置动画样式
      const animationName = isCapture ? 'pieceMoveCapture' : 'pieceMove'
      ;(pieceElement as HTMLElement).style.animation = `${animationName} ${config.duration}ms ${config.easing}`

      const handleAnimationEnd = () => {
        pieceElement.removeEventListener('animationend', handleAnimationEnd)
        pieceElement.classList.remove('piece-moving')
        ;(pieceElement as HTMLElement).style.animation = ''
        resolve()
      }

      pieceElement.addEventListener('animationend', handleAnimationEnd)
    })
  }

  /**
   * 获取棋子DOM元素
   */
  private getPieceElement(pieceId: string): Element | null {
    return document.querySelector(`[data-piece-id="${pieceId}"]`)
  }

  /**
   * 获取棋格DOM元素
   */
  private getSquareElement(row: number, col: number): Element | null {
    return document.querySelector(`[data-square="${row}-${col}"]`)
  }

  /**
   * 检查是否有动画正在进行
   */
  isAnimating(pieceId?: string): boolean {
    if (pieceId) {
      return this.animatingPieces.has(pieceId)
    }
    return this.animatingPieces.size > 0
  }

  /**
   * 等待所有动画完成
   */
  async waitForAllAnimations(): Promise<void> {
    const promises = Array.from(this.animationPromises.values())
    await Promise.all(promises)
  }

  /**
   * 强制停止所有动画
   */
  stopAllAnimations(): void {
    this.animatingPieces.clear()
    this.animationPromises.clear()
    
    // 移除棋子动画类
    const animatedElements = document.querySelectorAll('.piece-moving, .piece-captured')
    animatedElements.forEach(element => {
      element.classList.remove('piece-moving', 'piece-captured')
      ;(element as HTMLElement).style.animation = ''
    })
    
    // 移除胜利动画类
    const boardElement = document.querySelector('.chess-board-container')
    if (boardElement) {
      boardElement.classList.remove('board-victory', 'victory-red', 'victory-black')
    }
    
    // 移除棋子胜利光效
    const victoryPieces = document.querySelectorAll('.piece-victory-glow')
    victoryPieces.forEach(piece => {
      piece.classList.remove('piece-victory-glow')
      ;(piece as HTMLElement).style.animation = ''
    })
    
    // 清除高亮效果
    this.clearAllHighlights()
  }
}

// 创建全局动画管理器实例
export const animationManager = new AnimationManager()

/**
 * 便捷的动画函数
 */
export const animatePieceMove = (
  pieceId: string,
  fromPosition: Position,
  toPosition: Position,
  isCapture = false
): Promise<void> => {
  return animationManager.animatePieceMove(pieceId, fromPosition, toPosition, isCapture)
}

export const animatePieceCapture = (pieceId: string): Promise<void> => {
  return animationManager.animatePieceCapture(pieceId)
}

export const animatePieceSelect = (pieceId: string): void => {
  animationManager.animatePieceSelect(pieceId)
}

export const animatePieceDeselect = (pieceId: string): void => {
  animationManager.animatePieceDeselect(pieceId)
}