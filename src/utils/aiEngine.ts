import type { ChessPiece, PieceColor, Move, AIDifficulty } from '../types/chess'
import { cloneBoard } from './boardUtils'
import { getValidMoves, isInCheck, isCheckmate } from './moveValidation'

/**
 * AI引擎类 - 实现象棋AI算法
 */
export class AIEngine {
  private difficulty: AIDifficulty
  private color: PieceColor

  constructor(difficulty: AIDifficulty, color: PieceColor) {
    this.difficulty = difficulty
    this.color = color
  }

  /**
   * 获取AI的最佳移动
   */
  async getBestMove(board: (ChessPiece | null)[][]): Promise<Move | null> {
    // 模拟思考时间
    if (this.difficulty.thinkingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, this.difficulty.thinkingTime))
    }

    const allMoves = this.getAllPossibleMoves(board, this.color)
    
    if (allMoves.length === 0) {
      return null
    }

    // 根据难度选择不同策略
    let bestMove: Move

    switch (this.difficulty.depth) {
      case 1:
        bestMove = this.getEasyMove(board, allMoves)
        break
      case 2:
        bestMove = this.getMediumMove(board, allMoves)
        break
      case 3:
      default:
        bestMove = this.getHardMove(board, allMoves)
        break
    }

    // 添加随机性
    if (this.difficulty.randomness > 0 && Math.random() < this.difficulty.randomness) {
      const randomIndex = Math.floor(Math.random() * allMoves.length)
      bestMove = allMoves[randomIndex]
    }

    return bestMove
  }

  /**
   * 简单AI - 随机选择合法移动，优先吃子
   */
  private getEasyMove(board: (ChessPiece | null)[][], moves: Move[]): Move {
    // 优先选择能吃子的移动
    const captureMoves = moves.filter(move => 
      board[move.to.row][move.to.col] !== null
    )

    if (captureMoves.length > 0) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)]
    }

    // 没有吃子机会就随机移动
    return moves[Math.floor(Math.random() * moves.length)]
  }

  /**
   * 中等AI - 使用简单的位置评估
   */
  private getMediumMove(board: (ChessPiece | null)[][], moves: Move[]): Move {
    let bestMove = moves[0]
    let bestScore = -Infinity

    for (const move of moves) {
      const newBoard = this.simulateMove(board, move)
      const score = this.evaluatePosition(newBoard, this.color)
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  /**
   * 困难AI - 使用简化的Minimax算法
   */
  private getHardMove(board: (ChessPiece | null)[][], moves: Move[]): Move {
    let bestMove = moves[0]
    let bestScore = -Infinity

    for (const move of moves) {
      const newBoard = this.simulateMove(board, move)
      const score = this.minimax(newBoard, this.difficulty.depth - 1, false, -Infinity, Infinity)
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  /**
   * Minimax算法实现（带Alpha-Beta剪枝）
   */
  private minimax(
    board: (ChessPiece | null)[][],
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number
  ): number {
    // 达到搜索深度或游戏结束
    if (depth === 0) {
      return this.evaluatePosition(board, this.color)
    }

    const currentColor: PieceColor = isMaximizing ? this.color : (this.color === 'red' ? 'black' : 'red')
    
    // 检查游戏是否结束
    if (isCheckmate(board, currentColor)) {
      return isMaximizing ? -10000 : 10000
    }

    const moves = this.getAllPossibleMoves(board, currentColor)
    
    if (moves.length === 0) {
      return 0 // 平局
    }

    if (isMaximizing) {
      let maxEval = -Infinity
      for (const move of moves) {
        const newBoard = this.simulateMove(board, move)
        const eval_ = this.minimax(newBoard, depth - 1, false, alpha, beta)
        maxEval = Math.max(maxEval, eval_)
        alpha = Math.max(alpha, eval_)
        if (beta <= alpha) {
          break // Beta剪枝
        }
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (const move of moves) {
        const newBoard = this.simulateMove(board, move)
        const eval_ = this.minimax(newBoard, depth - 1, true, alpha, beta)
        minEval = Math.min(minEval, eval_)
        beta = Math.min(beta, eval_)
        if (beta <= alpha) {
          break // Alpha剪枝
        }
      }
      return minEval
    }
  }

  /**
   * 位置评估函数
   */
  private evaluatePosition(board: (ChessPiece | null)[][], color: PieceColor): number {
    let score = 0

    // 棋子价值表
    const pieceValues = {
      king: 10000,
      advisor: 200,
      elephant: 200,
      horse: 400,
      chariot: 900,
      cannon: 450,
      soldier: 100
    }

    // 位置权重表（简化版）
    const positionWeights = {
      king: [
        [0, 0, 0, 8, 9, 8, 0, 0, 0],
        [0, 0, 0, 9, 10, 9, 0, 0, 0],
        [0, 0, 0, 8, 9, 8, 0, 0, 0]
      ],
      soldier: [
        [9, 9, 9, 11, 13, 11, 9, 9, 9],
        [19, 24, 34, 42, 44, 42, 34, 24, 19],
        [19, 24, 32, 37, 37, 37, 32, 24, 19],
        [19, 23, 27, 29, 30, 29, 27, 23, 19],
        [14, 18, 20, 27, 29, 27, 20, 18, 14],
        [7, 0, 13, 0, 16, 0, 13, 0, 7],
        [7, 0, 7, 0, 15, 0, 7, 0, 7]
      ]
    }

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board[row][col]
        if (!piece) continue

        let pieceScore = pieceValues[piece.type]
        
        // 添加位置奖励
        if (piece.type === 'king' && positionWeights.king) {
          const palaceRow = piece.color === 'red' ? row - 7 : row
          if (palaceRow >= 0 && palaceRow < 3) {
            pieceScore += positionWeights.king[palaceRow][col] || 0
          }
        } else if (piece.type === 'soldier' && positionWeights.soldier) {
          const soldierRow = piece.color === 'red' ? 9 - row : row
          if (soldierRow >= 0 && soldierRow < positionWeights.soldier.length) {
            pieceScore += positionWeights.soldier[soldierRow][col] || 0
          }
        }

        // 根据棋子颜色调整分数
        if (piece.color === color) {
          score += pieceScore
        } else {
          score -= pieceScore
        }
      }
    }

    // 检查将军状态
    if (isInCheck(board, color)) {
      score -= 500
    }
    
    const enemyColor: PieceColor = color === 'red' ? 'black' : 'red'
    if (isInCheck(board, enemyColor)) {
      score += 500
    }

    return score
  }

  /**
   * 获取指定颜色的所有可能移动
   */
  private getAllPossibleMoves(board: (ChessPiece | null)[][], color: PieceColor): Move[] {
    const moves: Move[] = []

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board[row][col]
        if (piece && piece.color === color) {
          const validMoves = getValidMoves(board, piece, { row, col })
          
          for (const to of validMoves) {
            moves.push({
              from: { row, col },
              to,
              piece,
              capturedPiece: board[to.row][to.col] || undefined,
              timestamp: Date.now()
            })
          }
        }
      }
    }

    return moves
  }

  /**
   * 模拟移动
   */
  private simulateMove(board: (ChessPiece | null)[][], move: Move): (ChessPiece | null)[][] {
    const newBoard = cloneBoard(board)
    newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col]
    newBoard[move.from.row][move.from.col] = null
    return newBoard
  }
}

/**
 * AI难度配置
 */
export const AI_DIFFICULTIES: Record<'easy' | 'medium' | 'hard', AIDifficulty> = {
  easy: {
    depth: 1,
    thinkingTime: 500,
    randomness: 0.3
  },
  medium: {
    depth: 2,
    thinkingTime: 1000,
    randomness: 0.1
  },
  hard: {
    depth: 3,
    thinkingTime: 2000,
    randomness: 0.05
  }
}