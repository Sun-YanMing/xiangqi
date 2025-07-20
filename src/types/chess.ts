// 棋子类型
export type PieceType = 'king' | 'advisor' | 'elephant' | 'horse' | 'chariot' | 'cannon' | 'soldier'

// 棋子颜色
export type PieceColor = 'red' | 'black'

// 棋子接口
export interface ChessPiece {
  type: PieceType
  color: PieceColor
  id: string
}

// 动画中的棋子（带位置信息）
export interface AnimatingPiece {
  piece: ChessPiece
  position: Position
}

// 位置接口
export interface Position {
  row: number
  col: number
}

// 移动记录
export interface Move {
  from: Position
  to: Position
  piece: ChessPiece
  capturedPiece?: ChessPiece
  timestamp: number
}

// 游戏状态
export type GameStatus = 'waiting' | 'playing' | 'checkmate' | 'stalemate' | 'draw'

// 游戏模式
export type GameMode = 'pvp' | 'ai-easy' | 'ai-medium' | 'ai-hard' | 'ai-expert'

// 主题类型
export type Theme = 'classic' | 'modern' | 'wooden' | 'marble'

// 游戏状态接口
export interface GameState {
  board: (ChessPiece | null)[][]
  currentPlayer: PieceColor
  gameStatus: GameStatus
  gameMode: GameMode
  selectedPosition: Position | null
  validMoves: Position[]
  moveHistory: Move[]
  capturedPieces: {
    red: ChessPiece[]
    black: ChessPiece[]
  }
  theme: Theme
  isInCheck: boolean
  winner: PieceColor | null
  animatingPieces: AnimatingPiece[] // 正在动画中的棋子，用于保持渲染
}

// AI 难度
export interface AIDifficulty {
  depth: number
  thinkingTime: number
  randomness: number
  name: string
}

// 游戏设置
export interface GameSettings {
  theme: Theme
  soundEnabled: boolean
  animationEnabled: boolean
  aiDifficulty: Record<'easy' | 'medium' | 'hard' | 'expert', AIDifficulty>
}

// 棋子中文名称映射
export const PIECE_NAMES: Record<PieceColor, Record<PieceType, string>> = {
  red: {
    king: '帅',
    advisor: '仕',
    elephant: '相',
    horse: '马',
    chariot: '车',
    cannon: '炮',
    soldier: '兵'
  },
  black: {
    king: '将',
    advisor: '士',
    elephant: '象',
    horse: '马',
    chariot: '车',
    cannon: '炮',
    soldier: '卒'
  }
}