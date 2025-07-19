import type { ChessPiece, Position, PieceColor } from '../types/chess'
import { 
  isValidPosition, 
  isInPalace, 
  isInOwnTerritory, 
  getLinePath, 
  isPathBlocked 
} from './boardUtils'

/**
 * 验证棋子移动是否合法
 */
export const isValidMove = (
  board: (ChessPiece | null)[][],
  piece: ChessPiece,
  from: Position,
  to: Position
): boolean => {
  // 基础验证
  if (!isValidPosition(to)) return false
  if (from.row === to.row && from.col === to.col) return false
  
  // 检查目标位置是否有己方棋子
  const targetPiece = board[to.row][to.col]
  if (targetPiece && targetPiece.color === piece.color) return false
  
  // 根据棋子类型验证移动规则
  let isValidBasicMove = false
  switch (piece.type) {
    case 'king':
      isValidBasicMove = isValidKingMove(board, piece, from, to)
      break
    case 'advisor':
      isValidBasicMove = isValidAdvisorMove(board, piece, from, to)
      break
    case 'elephant':
      isValidBasicMove = isValidElephantMove(board, piece, from, to)
      break
    case 'horse':
      isValidBasicMove = isValidHorseMove(board, piece, from, to)
      break
    case 'chariot':
      isValidBasicMove = isValidChariotMove(board, piece, from, to)
      break
    case 'cannon':
      isValidBasicMove = isValidCannonMove(board, piece, from, to)
      break
    case 'soldier':
      isValidBasicMove = isValidSoldierMove(board, piece, from, to)
      break
    default:
      return false
  }
  
  // 如果基本移动规则不通过，直接返回false
  if (!isValidBasicMove) return false
  
  // 模拟移动后检查是否会让己方将军被将军（将军自救检查）
  const newBoard = board.map(row => [...row])
  newBoard[to.row][to.col] = piece
  newBoard[from.row][from.col] = null
  
  // 检查移动后己方是否仍被将军
  if (isInCheck(newBoard, piece.color)) {
    // 调试信息：记录被阻止的移动
    console.log(`阻止移动: ${piece.color}${piece.type} 从 (${from.row},${from.col}) 到 (${to.row},${to.col}) - 会导致将军`)
    return false
  }
  
  return true
}

/**
 * 将军（帅）移动规则验证
 */
const isValidKingMove = (
  board: (ChessPiece | null)[][],
  piece: ChessPiece,
  from: Position,
  to: Position
): boolean => {
  // 只能在九宫格内移动
  if (!isInPalace(to, piece.color)) return false
  
  // 只能移动一格（水平或垂直）
  const rowDiff = Math.abs(to.row - from.row)
  const colDiff = Math.abs(to.col - from.col)
  
  if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
    return true
  }
  
  // 特殊规则：将军对脸（飞将）- 当两个将军在同一列且中间无子时
  if (from.col === to.col && from.row !== to.row) {
    const targetPiece = board[to.row][to.col]
    if (targetPiece && targetPiece.type === 'king' && targetPiece.color !== piece.color) {
      // 检查中间是否有棋子阻挡
      const path = getLinePath(from, to)
      return !isPathBlocked(board, path)
    }
  }
  
  return false
}

/**
 * 士（仕）移动规则验证
 */
const isValidAdvisorMove = (
  _board: (ChessPiece | null)[][],
  piece: ChessPiece,
  from: Position,
  to: Position
): boolean => {
  // 只能在九宫格内移动
  if (!isInPalace(to, piece.color)) return false
  
  // 只能斜着移动一格
  const rowDiff = Math.abs(to.row - from.row)
  const colDiff = Math.abs(to.col - from.col)
  
  return rowDiff === 1 && colDiff === 1
}

/**
 * 象（相）移动规则验证
 */
const isValidElephantMove = (
  board: (ChessPiece | null)[][],
  piece: ChessPiece,
  from: Position,
  to: Position
): boolean => {
  // 不能过河
  if (!isInOwnTerritory(to, piece.color)) return false
  
  // 只能斜着移动两格（田字格）
  const rowDiff = to.row - from.row
  const colDiff = to.col - from.col
  
  if (Math.abs(rowDiff) !== 2 || Math.abs(colDiff) !== 2) return false
  
  // 检查象眼（田字中心）是否被堵
  const eyeRow = from.row + rowDiff / 2
  const eyeCol = from.col + colDiff / 2
  
  return board[eyeRow][eyeCol] === null
}

/**
 * 马移动规则验证
 */
const isValidHorseMove = (
  board: (ChessPiece | null)[][],
  _piece: ChessPiece,
  from: Position,
  to: Position
): boolean => {
  const rowDiff = to.row - from.row
  const colDiff = to.col - from.col
  
  // 马走日字
  const isValidL = (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
                   (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)
  
  if (!isValidL) return false
  
  // 检查马腿是否被绊
  let legRow = from.row
  let legCol = from.col
  
  if (Math.abs(rowDiff) === 2) {
    legRow = from.row + rowDiff / 2
  } else {
    legCol = from.col + colDiff / 2
  }
  
  return board[legRow][legCol] === null
}

/**
 * 车移动规则验证
 */
const isValidChariotMove = (
  board: (ChessPiece | null)[][],
  _piece: ChessPiece,
  from: Position,
  to: Position
): boolean => {
  // 只能直线移动（水平或垂直）
  if (from.row !== to.row && from.col !== to.col) return false
  
  // 检查路径是否被阻挡
  const path = getLinePath(from, to)
  return !isPathBlocked(board, path)
}

/**
 * 炮移动规则验证
 */
const isValidCannonMove = (
  board: (ChessPiece | null)[][],
  _piece: ChessPiece,
  from: Position,
  to: Position
): boolean => {
  // 只能直线移动（水平或垂直）
  if (from.row !== to.row && from.col !== to.col) return false
  
  const path = getLinePath(from, to)
  const blockedCount = path.filter(pos => board[pos.row][pos.col] !== null).length
  const targetPiece = board[to.row][to.col]
  
  if (targetPiece) {
    // 吃子时必须翻山（中间有且仅有一个棋子）
    return blockedCount === 1
  } else {
    // 移动时路径必须畅通
    return blockedCount === 0
  }
}

/**
 * 兵（卒）移动规则验证
 */
const isValidSoldierMove = (
  _board: (ChessPiece | null)[][],
  piece: ChessPiece,
  from: Position,
  to: Position
): boolean => {
  const rowDiff = to.row - from.row
  const colDiff = to.col - from.col
  
  // 只能移动一格
  if (Math.abs(rowDiff) + Math.abs(colDiff) !== 1) return false
  
  if (piece.color === 'red') {
    // 红兵：过河前只能向前，过河后可以左右移动
    if (from.row > 4) {
      // 未过河（在己方领域），只能向前（向上，row减小）
      return rowDiff === -1 && colDiff === 0
    } else {
      // 已过河（在敌方领域），可以向前或左右移动，但不能后退
      if (colDiff === 0) {
        // 前进
        return rowDiff === -1
      } else {
        // 左右移动
        return rowDiff === 0 && Math.abs(colDiff) === 1
      }
    }
  } else {
    // 黑卒：过河前只能向前，过河后可以左右移动
    if (from.row < 5) {
      // 未过河（在己方领域），只能向前（向下，row增大）
      return rowDiff === 1 && colDiff === 0
    } else {
      // 已过河（在敌方领域），可以向前或左右移动，但不能后退
      if (colDiff === 0) {
        // 前进
        return rowDiff === 1
      } else {
        // 左右移动
        return rowDiff === 0 && Math.abs(colDiff) === 1
      }
    }
  }
}

/**
 * 获取棋子的所有合法移动位置
 */
export const getValidMoves = (
  board: (ChessPiece | null)[][],
  piece: ChessPiece,
  from: Position
): Position[] => {
  const validMoves: Position[] = []
  
  // 遍历整个棋盘，检查每个位置
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const to: Position = { row, col }
      if (isValidMove(board, piece, from, to)) {
        validMoves.push(to)
      }
    }
  }
  
  return validMoves
}

/**
 * 基础移动验证（不检查将军自救）
 * 用于isInCheck函数，避免循环递归
 */
const isValidBasicMoveOnly = (
  board: (ChessPiece | null)[][],
  piece: ChessPiece,
  from: Position,
  to: Position
): boolean => {
  // 基础验证
  if (!isValidPosition(to)) return false
  if (from.row === to.row && from.col === to.col) return false
  
  // 检查目标位置是否有己方棋子
  const targetPiece = board[to.row][to.col]
  if (targetPiece && targetPiece.color === piece.color) return false
  
  // 根据棋子类型验证移动规则
  switch (piece.type) {
    case 'king':
      return isValidKingMove(board, piece, from, to)
    case 'advisor':
      return isValidAdvisorMove(board, piece, from, to)
    case 'elephant':
      return isValidElephantMove(board, piece, from, to)
    case 'horse':
      return isValidHorseMove(board, piece, from, to)
    case 'chariot':
      return isValidChariotMove(board, piece, from, to)
    case 'cannon':
      return isValidCannonMove(board, piece, from, to)
    case 'soldier':
      return isValidSoldierMove(board, piece, from, to)
    default:
      return false
  }
}

/**
 * 检查是否将军
 */
export const isInCheck = (
  board: (ChessPiece | null)[][],
  kingColor: PieceColor
): boolean => {
  // 找到己方将军位置
  let kingPosition: Position | null = null
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (piece && piece.type === 'king' && piece.color === kingColor) {
        kingPosition = { row, col }
        break
      }
    }
    if (kingPosition) break
  }
  
  if (!kingPosition) return false
  
  // 检查是否有敌方棋子能攻击到将军（使用基础移动验证避免递归）
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (piece && piece.color !== kingColor) {
        if (isValidBasicMoveOnly(board, piece, { row, col }, kingPosition)) {
          return true
        }
      }
    }
  }
  
  return false
}

/**
 * 检查是否将死
 */
export const isCheckmate = (
  board: (ChessPiece | null)[][],
  kingColor: PieceColor
): boolean => {
  // 如果没有被将军，就不是将死
  if (!isInCheck(board, kingColor)) return false
  
  // 尝试所有可能的移动，看是否能解除将军
  for (let fromRow = 0; fromRow < 10; fromRow++) {
    for (let fromCol = 0; fromCol < 9; fromCol++) {
      const piece = board[fromRow][fromCol]
      if (piece && piece.color === kingColor) {
        const validMoves = getValidMoves(board, piece, { row: fromRow, col: fromCol })
        
        for (const move of validMoves) {
          // 模拟移动
          const newBoard = board.map(row => [...row])
          newBoard[move.row][move.col] = piece
          newBoard[fromRow][fromCol] = null
          
          // 检查移动后是否还在被将军
          if (!isInCheck(newBoard, kingColor)) {
            return false // 找到解除将军的方法，不是将死
          }
        }
      }
    }
  }
  
  return true // 没有任何方法解除将军，是将死
}