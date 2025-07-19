import type { ChessPiece, Position, PieceColor, PieceType } from '../types/chess'

/**
 * 创建棋子对象
 */
export const createPiece = (
  type: PieceType, 
  color: PieceColor, 
  row: number, 
  col: number
): ChessPiece => ({
  type,
  color,
  id: `${color}-${type}-${row}-${col}-${Date.now()}`
})

/**
 * 创建初始象棋棋盘布局
 * 返回9x10的二维数组，包含所有棋子的初始位置
 */
export const createInitialBoard = (): (ChessPiece | null)[][] => {
  // 创建9x10的空棋盘
  const board: (ChessPiece | null)[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 9 }, () => null)
  )

  // 黑方棋子布局 (上方，行0-4)
  // 第一行：车马象士将士象马车
  board[0][0] = createPiece('chariot', 'black', 0, 0)
  board[0][1] = createPiece('horse', 'black', 0, 1)
  board[0][2] = createPiece('elephant', 'black', 0, 2)
  board[0][3] = createPiece('advisor', 'black', 0, 3)
  board[0][4] = createPiece('king', 'black', 0, 4)
  board[0][5] = createPiece('advisor', 'black', 0, 5)
  board[0][6] = createPiece('elephant', 'black', 0, 6)
  board[0][7] = createPiece('horse', 'black', 0, 7)
  board[0][8] = createPiece('chariot', 'black', 0, 8)

  // 第三行：炮
  board[2][1] = createPiece('cannon', 'black', 2, 1)
  board[2][7] = createPiece('cannon', 'black', 2, 7)

  // 第四行：卒
  for (let col = 0; col < 9; col += 2) {
    board[3][col] = createPiece('soldier', 'black', 3, col)
  }

  // 红方棋子布局 (下方，行5-9)
  // 第七行：兵
  for (let col = 0; col < 9; col += 2) {
    board[6][col] = createPiece('soldier', 'red', 6, col)
  }

  // 第八行：炮
  board[7][1] = createPiece('cannon', 'red', 7, 1)
  board[7][7] = createPiece('cannon', 'red', 7, 7)

  // 第十行：车马相仕帅仕相马车
  board[9][0] = createPiece('chariot', 'red', 9, 0)
  board[9][1] = createPiece('horse', 'red', 9, 1)
  board[9][2] = createPiece('elephant', 'red', 9, 2)
  board[9][3] = createPiece('advisor', 'red', 9, 3)
  board[9][4] = createPiece('king', 'red', 9, 4)
  board[9][5] = createPiece('advisor', 'red', 9, 5)
  board[9][6] = createPiece('elephant', 'red', 9, 6)
  board[9][7] = createPiece('horse', 'red', 9, 7)
  board[9][8] = createPiece('chariot', 'red', 9, 8)

  return board
}

/**
 * 深拷贝棋盘
 */
export const cloneBoard = (board: (ChessPiece | null)[][]): (ChessPiece | null)[][] => {
  return board.map(row => 
    row.map(piece => piece ? { ...piece } : null)
  )
}

/**
 * 检查位置是否在棋盘范围内
 */
export const isValidPosition = (position: Position): boolean => {
  const { row, col } = position
  return row >= 0 && row <= 9 && col >= 0 && col <= 8
}

/**
 * 检查位置是否在河界范围内
 */
export const isInRiver = (position: Position): boolean => {
  return position.row === 4 || position.row === 5
}

/**
 * 检查位置是否在九宫格内
 */
export const isInPalace = (position: Position, color: PieceColor): boolean => {
  const { row, col } = position
  
  if (color === 'red') {
    // 红方九宫格 (行 7-9, 列 3-5)
    return row >= 7 && row <= 9 && col >= 3 && col <= 5
  } else {
    // 黑方九宫格 (行 0-2, 列 3-5)
    return row >= 0 && row <= 2 && col >= 3 && col <= 5
  }
}

/**
 * 检查位置是否在己方领域
 */
export const isInOwnTerritory = (position: Position, color: PieceColor): boolean => {
  if (color === 'red') {
    return position.row >= 5
  } else {
    return position.row <= 4
  }
}

/**
 * 获取两个位置之间的直线路径（不包含起点和终点）
 */
export const getLinePath = (from: Position, to: Position): Position[] => {
  const path: Position[] = []
  const rowDiff = to.row - from.row
  const colDiff = to.col - from.col
  
  // 只处理直线移动（水平、垂直）
  if (rowDiff !== 0 && colDiff !== 0) {
    return path
  }
  
  const rowStep = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1
  const colStep = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1
  
  let currentRow = from.row + rowStep
  let currentCol = from.col + colStep
  
  while (currentRow !== to.row || currentCol !== to.col) {
    path.push({ row: currentRow, col: currentCol })
    currentRow += rowStep
    currentCol += colStep
  }
  
  return path
}

/**
 * 检查路径是否被阻挡
 */
export const isPathBlocked = (
  board: (ChessPiece | null)[][], 
  path: Position[]
): boolean => {
  return path.some(position => board[position.row][position.col] !== null)
}