import React from 'react'
import type { Move } from '../types/chess'
import { PIECE_NAMES } from '../types/chess'

interface MoveHistoryProps {
  moves: Move[]
  onMoveClick?: (moveIndex: number) => void
}

/**
 * 移动历史记录组件
 * 显示所有棋步记录，支持点击回放
 */
const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, onMoveClick }) => {
  /**
   * 格式化移动记录文本 - 标准中国象棋记谱方式
   */
  const formatMove = (move: Move): string => {
    const pieceChar = PIECE_NAMES[move.piece.color][move.piece.type]
    const isRed = move.piece.color === 'red'
    
    // 中文数字列名
    const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
    
    // 中文数字行名（1-10）
    const chineseRowNumbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
    
    // 获取起始列的中文数字
    const fromCol = chineseNumbers[move.from.col]
    
    // 计算目标位置（红方从下往上数1-10，黑方从上往下数1-10）
    const toRowNum = isRed ? (10 - move.to.row) : (move.to.row + 1)
    const toRow = chineseRowNumbers[toRowNum] || toRowNum.toString()
    
    // 判断移动类型
    let moveType: string
    const rowDiff = move.to.row - move.from.row
    const colDiff = move.to.col - move.from.col
    
    if (move.capturedPiece) {
      // 有吃子，显示被吃棋子名称
      const capturedPieceName = PIECE_NAMES[move.capturedPiece.color][move.capturedPiece.type]
      moveType = `吃${capturedPieceName}`
    } else if (colDiff === 0) {
      // 同列移动
      if ((isRed && rowDiff < 0) || (!isRed && rowDiff > 0)) {
        moveType = '进' // 向前
      } else {
        moveType = '退' // 向后
      }
    } else {
      // 横向移动
      moveType = '平'
    }
    
    // 目标位置描述
    let targetDesc: string
    if (moveType === '平') {
      // 平移到某列
      targetDesc = chineseNumbers[move.to.col]
    } else {
      // 进退到某行
      targetDesc = toRow
    }
    
    return `${pieceChar}${fromCol}${moveType}${targetDesc}`
  }

  /**
   * 获取移动的颜色样式
   */
  const getMoveColorClass = (move: Move): string => {
    return move.piece.color === 'red' ? 'text-red-600' : 'text-gray-700'
  }

  if (moves.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3">棋谱记录</h3>
        <p className="text-gray-500 text-center py-4">暂无棋步记录</p>
      </div>
    )
  }

  // 将移动按回合分组
  const rounds = []
  for (let i = 0; i < moves.length; i += 2) {
    const redMove = moves[i]
    const blackMove = moves[i + 1]
    rounds.push({ red: redMove, black: blackMove })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-h-80 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <span className="i-tabler-list mr-2"></span>
        棋谱记录 ({moves.length} 步)
      </h3>
      
      <div className="space-y-1">
        {rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="flex items-center text-sm">
            {/* 回合数 */}
            <div className="w-8 text-gray-500 font-medium">
              {roundIndex + 1}.
            </div>
            
            {/* 红方移动 */}
            <div 
              className={`flex-1 px-2 py-1 rounded cursor-pointer hover:bg-gray-50 ${getMoveColorClass(round.red)}`}
              onClick={() => onMoveClick?.(roundIndex * 2)}
              title={`第${roundIndex + 1}回合红方: ${formatMove(round.red)}`}
            >
              {formatMove(round.red)}
            </div>
            
            {/* 黑方移动 */}
            {round.black && (
              <div 
                className={`flex-1 px-2 py-1 rounded cursor-pointer hover:bg-gray-50 ${getMoveColorClass(round.black)}`}
                onClick={() => onMoveClick?.(roundIndex * 2 + 1)}
                title={`第${roundIndex + 1}回合黑方: ${formatMove(round.black)}`}
              >
                {formatMove(round.black)}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 统计信息 */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        总共 {Math.floor(moves.length / 2)} 个回合
        {moves.length % 2 === 1 && ` (红方已走)`}
      </div>
    </div>
  )
}

export default MoveHistory