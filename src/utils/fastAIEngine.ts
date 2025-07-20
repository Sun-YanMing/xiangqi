import type { ChessPiece, PieceColor, Move, AIDifficulty } from '../types/chess'
import { cloneBoard } from './boardUtils'
import { getValidMoves, isCheckmate } from './moveValidation'

/**
 * 快速AI引擎类 - 性能优化版本
 * 专注于核心功能，避免复杂计算导致的性能问题
 */
export class FastAIEngine {
  private difficulty: AIDifficulty
  private color: PieceColor
  private searchStats: { nodesSearched: number; startTime: number }

  constructor(difficulty: AIDifficulty, color: PieceColor) {
    this.difficulty = difficulty
    this.color = color
    this.searchStats = { nodesSearched: 0, startTime: 0 }
  }

  /**
   * 获取AI的最佳移动 - 快速版本
   */
  async getBestMove(board: (ChessPiece | null)[][]): Promise<Move | null> {
    this.searchStats = { nodesSearched: 0, startTime: Date.now() }

    const maxDepth = Math.min(this.difficulty.depth + 1, 3) // 最大3层搜索
    console.log(`🚀 快速AI开始思考，AI颜色: ${this.color}，搜索深度: ${maxDepth}层`)

    // 首先检查是否有合法移动
    const allMoves = this.getAllPossibleMoves(board, this.color)
    if (allMoves.length === 0) {
      console.log(`💀 AI(${this.color})没有任何合法移动`)
      return null
    }

    let bestMove: Move | null = null

    for (let depth = 1; depth <= maxDepth; depth++) {
      // 严格时间控制
      if (Date.now() - this.searchStats.startTime > this.difficulty.thinkingTime * 0.7) {
        console.log(`⏰ 时间限制，提前结束搜索在深度 ${depth - 1}`)
        break
      }

      const result = this.alphaBetaSearch(
        board, 
        depth, 
        -Infinity, 
        Infinity, 
        true, // AI总是最大化自己的分数
        0
      )
      
      if (result && result.move) {
        bestMove = result.move
        console.log(`深度 ${depth}: 评分 ${result.score.toFixed(2)}`)
        
        // 如果找到很好的棋或时间不够，提前结束
        if (Math.abs(result.score) > 2000 || Date.now() - this.searchStats.startTime > this.difficulty.thinkingTime * 0.8) {
          break
        }
      }
    }

    const elapsed = Date.now() - this.searchStats.startTime
    console.log(`🧠 搜索完成: ${this.searchStats.nodesSearched} 节点, ${elapsed}ms`)

    return bestMove
  }

  /**
   * Alpha-Beta搜索算法 - 简化版本
   */
  private alphaBetaSearch(
    board: (ChessPiece | null)[][],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    ply: number
  ): { score: number; move?: Move } | null {
    this.searchStats.nodesSearched++

    // 时间限制检查
    if (Date.now() - this.searchStats.startTime > this.difficulty.thinkingTime) {
      return null
    }

    // 达到最大深度
    if (depth <= 0) {
      return { score: this.evaluatePosition(board) }
    }

    // 检查游戏结束状态
    const currentPlayer: PieceColor = isMaximizing ? this.color : (this.color === 'red' ? 'black' : 'red')
    if (isCheckmate(board, currentPlayer)) {
      return { score: isMaximizing ? -9999 + ply : 9999 - ply }
    }

    let bestMove: Move | undefined
    let bestScore = isMaximizing ? -Infinity : Infinity
    
    // 获取所有可能的移动
    const moves = this.getAllPossibleMoves(board, currentPlayer)
    
    // 如果没有合法移动，返回null（将死或和棋）
    if (moves.length === 0) {
      console.log(`⚠️ ${currentPlayer}方没有合法移动`)
      return { score: isMaximizing ? -9999 + ply : 9999 - ply }
    }
    
    // 简单排序：捕获移动优先
    moves.sort((a, b) => {
      const scoreA = a.capturedPiece ? this.getPieceValue(a.capturedPiece) : 0
      const scoreB = b.capturedPiece ? this.getPieceValue(b.capturedPiece) : 0
      return scoreB - scoreA
    })
    
    for (const move of moves) {
      // 执行移动
      const newBoard = this.makeMove(board, move)
      
      // 递归搜索
      const result = this.alphaBetaSearch(
        newBoard,
        depth - 1,
        alpha,
        beta,
        !isMaximizing,
        ply + 1
      )

      if (!result) continue

      if (isMaximizing) {
        if (result.score > bestScore) {
          bestScore = result.score
          bestMove = move
        }
        alpha = Math.max(alpha, result.score)
      } else {
        if (result.score < bestScore) {
          bestScore = result.score
          bestMove = move
        }
        beta = Math.min(beta, result.score)
      }

      // Alpha-Beta剪枝
      if (beta <= alpha) {
        break
      }
    }

    return { score: bestScore, move: bestMove }
  }

  /**
   * 快速位置评估函数
   */
  private evaluatePosition(board: (ChessPiece | null)[][]): number {
    let redScore = 0
    let blackScore = 0

    // 分别计算红方和黑方的分数
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board[row][col]
        if (piece) {
          const value = this.getPieceValue(piece)
          const positionBonus = this.getPositionBonus(piece, row, col)
          const totalValue = value + positionBonus
          
          if (piece.color === 'red') {
            redScore += totalValue
          } else {
            blackScore += totalValue
          }
        }
      }
    }

    // AI从自己的角度评估：AI颜色的分数 - 对手颜色的分数
    return this.color === 'red' ? (redScore - blackScore) : (blackScore - redScore)
  }

  /**
   * 获取棋子价值
   */
  private getPieceValue(piece: ChessPiece): number {
    const values = {
      king: 0,        // 国王价值无限，不参与计算
      advisor: 250,   // 士
      elephant: 250,  // 象
      horse: 500,     // 马
      chariot: 1000,  // 车
      cannon: 550,    // 炮
      soldier: 100    // 兵
    }
    return values[piece.type] || 0
  }

  /**
   * 获取位置奖励分
   */
  private getPositionBonus(piece: ChessPiece, row: number, col: number): number {
    switch (piece.type) {
      case 'soldier':
        // 兵越靠前越有价值
        return piece.color === 'red' ? (9 - row) * 10 : row * 10
        
      case 'horse':
        // 马在中心更有价值
        return Math.max(0, 3 - Math.abs(col - 4)) * 10
        
      case 'chariot':
        // 车在开放线上更有价值
        return this.isOpenFile(row, col) ? 20 : 0
        
      default:
        return 0
    }
  }

  /**
   * 检查是否是开放线（简化版）
   */
  private isOpenFile(_row: number, _col: number): boolean {
    // 简化实现，总是返回false
    return false
  }

  /**
   * 获取所有可能的移动
   */
  private getAllPossibleMoves(board: (ChessPiece | null)[][], color: PieceColor): Move[] {
    const moves: Move[] = []
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board[row][col]
        if (piece && piece.color === color) {
          const validMoves = getValidMoves(board, piece, { row, col })
          
          for (const move of validMoves) {
            moves.push({
              from: { row, col },
              to: move,
              piece: piece,
              capturedPiece: board[move.row][move.col] || undefined,
              timestamp: Date.now()
            })
          }
        }
      }
    }
    
    return moves
  }

  /**
   * 执行移动
   */
  private makeMove(board: (ChessPiece | null)[][], move: Move): (ChessPiece | null)[][] {
    const newBoard = cloneBoard(board)
    newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col]
    newBoard[move.from.row][move.from.col] = null
    return newBoard
  }
}

/**
 * 快速AI难度配置
 */
export const FAST_AI_DIFFICULTIES = {
  easy: {
    depth: 1,
    thinkingTime: 500,
    randomness: 0.15,
    name: '入门'
  },
  medium: {
    depth: 2,
    thinkingTime: 800,
    randomness: 0.05,
    name: '业余'
  },
  hard: {
    depth: 2,
    thinkingTime: 1200,
    randomness: 0.01,
    name: '专业'
  },
  expert: {
    depth: 3,
    thinkingTime: 1500,
    randomness: 0,
    name: '大师'
  }
} as const