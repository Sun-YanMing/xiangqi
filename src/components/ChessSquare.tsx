import React from 'react'
import type { ChessPiece, Position, Theme } from '../types/chess'
import ChessPieceComponent from './ChessPieceComponent'

interface ChessSquareProps {
  position: Position
  piece: ChessPiece | null
  animatingPiece: ChessPiece | null // 正在动画中的被吃棋子
  isSelected: boolean
  isValidMove: boolean
  isRiverRow: boolean
  isPalacePosition: boolean
  onClick: () => void
  theme: Theme
}

/**
 * 象棋棋格组件
 * 渲染单个棋盘格子，包含棋子、选中状态、可移动提示等
 */
const ChessSquare: React.FC<ChessSquareProps> = ({
  position,
  piece,
  animatingPiece,
  isSelected,
  isValidMove,
  isRiverRow,
  isPalacePosition,
  onClick,
  theme
}) => {
  /**
   * 获取棋格基础样式类名
   */
  const getSquareClasses = (): string => {
    let classes = 'chess-square relative'
    
    // 选中状态
    if (isSelected) {
      classes += ' bg-blue-200 border-blue-500 border-2'
    }
    
    // 可移动位置提示
    if (isValidMove) {
      classes += ' bg-green-100 border-green-400'
    }
    
    // 河界样式
    if (isRiverRow) {
      classes += ' border-b-2 border-red-600'
    }
    
    // 九宫格样式
    if (isPalacePosition) {
      classes += ' bg-yellow-50'
    }
    
    // 主题样式
    const themeClasses = {
      classic: 'bg-yellow-50 border-gray-600',
      modern: 'bg-white border-blue-400',
      wooden: 'bg-amber-50 border-amber-800',
      marble: 'bg-gray-50 border-gray-500'
    }
    classes += ` ${themeClasses[theme]}`
    
    return classes
  }

  /**
   * 获取棋格线条样式
   */
  const getGridLines = (): React.ReactNode => {
    const { row, col } = position
    
    return (
      <>
        {/* 横线 */}
        {row < 9 && (
          <div className="absolute bottom-0 left-1/2 w-0 h-4 border-l border-gray-600 transform -translate-x-1/2" />
        )}
        
        {/* 竖线 */}
        {col < 8 && !isRiverRow && (
          <div className="absolute right-0 top-1/2 w-4 h-0 border-t border-gray-600 transform -translate-y-1/2" />
        )}
        
        {/* 九宫格对角线 */}
        {isPalacePosition && renderPalaceLines(row, col)}
      </>
    )
  }

  /**
   * 渲染九宫格对角线
   */
  const renderPalaceLines = (row: number, col: number): React.ReactNode => {
    const lines = []
    
    // 红方九宫格对角线
    if ((row === 7 || row === 9) && (col === 3 || col === 5)) {
      lines.push(
        <div key="diagonal" className="absolute inset-0">
          <svg className="w-full h-full">
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="#666" strokeWidth="1" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke="#666" strokeWidth="1" />
          </svg>
        </div>
      )
    }
    
    // 黑方九宫格对角线
    if ((row === 0 || row === 2) && (col === 3 || col === 5)) {
      lines.push(
        <div key="diagonal" className="absolute inset-0">
          <svg className="w-full h-full">
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="#666" strokeWidth="1" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke="#666" strokeWidth="1" />
          </svg>
        </div>
      )
    }
    
    return lines
  }

  return (
    <div
      className={getSquareClasses()}
      onClick={onClick}
      data-square={`${position.row}-${position.col}`}
      data-row={position.row}
      data-col={position.col}
    >
      {/* 棋格线条 */}
      {getGridLines()}
      
      {/* 可移动位置指示器 */}
      {isValidMove && !piece && (
        <div className="absolute inset-0 flex-center">
          <div className="w-3 h-3 bg-green-500 rounded-full opacity-70" />
        </div>
      )}
      
      {/* 正在动画中的被吃棋子（先渲染，在下层） */}
      {animatingPiece && (
        <ChessPieceComponent
          piece={animatingPiece}
          isSelected={false}
          theme={theme}
        />
      )}
      
      {/* 正常棋子（后渲染，在上层） */}
      {piece && (
        <ChessPieceComponent
          piece={piece}
          isSelected={isSelected}
          theme={theme}
        />
      )}
      
      {/* 位置坐标（开发模式显示） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 left-0 text-xs text-gray-400">
          {position.row},{position.col}
        </div>
      )}
    </div>
  )
}

export default ChessSquare