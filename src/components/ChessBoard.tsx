import React from 'react'
import type { Position, GameState } from '../types/chess'
import ChessSquare from './ChessSquare'

interface ChessBoardProps {
  gameState: GameState
  onSquareClick: (position: Position) => void
}

/**
 * 象棋棋盘组件
 * 渲染9x10的棋盘网格，包含河界和九宫格标记
 */
const ChessBoard: React.FC<ChessBoardProps> = ({ gameState, onSquareClick }) => {
  const { board, selectedPosition, validMoves, theme, animatingPieces } = gameState

  /**
   * 检查指定位置是否为有效移动位置
   */
  const isValidMove = (position: Position): boolean => {
    return validMoves.some(move => move.row === position.row && move.col === position.col)
  }

  /**
   * 检查指定位置是否为当前选中位置
   */
  const isSelected = (position: Position): boolean => {
    return selectedPosition?.row === position.row && selectedPosition?.col === position.col
  }

  /**
   * 获取棋盘主题样式类名
   */
  const getBoardThemeClass = (): string => {
    const themeClasses = {
      classic: 'board-classic',
      modern: 'board-modern', 
      wooden: 'board-wooden',
      marble: 'board-marble'
    }
    return themeClasses[theme]
  }

  /**
   * 获取3D立体样式 - 优化版本，减少变形
   */
  const get3DStyles = (): React.CSSProperties => {
    return {
      transform: 'perspective(2000px) rotateX(8deg)',
      transformStyle: 'preserve-3d',
      boxShadow: `
        0 15px 30px rgba(0, 0, 0, 0.2),
        0 8px 16px rgba(0, 0, 0, 0.15),
        inset 0 0 0 1px rgba(255, 255, 255, 0.05)
      `
    }
  }

  return (
    <div className="chess-board-container relative">
      {/* 3D棋盘外框 */}
      <div 
        className={`inline-block p-6 rounded-xl ${getBoardThemeClass()}`}
        style={get3DStyles()}
      >
        {/* 棋盘边框装饰 */}
        <div className="board-frame relative">
          {/* 棋盘网格 */}
          <div className="grid grid-cols-9 gap-0 board-grid">
        {Array.from({ length: 10 }, (_, row) =>
          Array.from({ length: 9 }, (_, col) => {
            const position: Position = { row, col }
            const piece = board[row][col]
            
            // 检查是否有被吃的棋子在这个位置需要显示动画
            // 被吃棋子与移动来的棋子可能在同一位置，需要都渲染
            const animatingPieceAtPosition = animatingPieces.find(ap => 
              ap.position.row === row && ap.position.col === col
            )
            
            return (
              <ChessSquare
                key={`${row}-${col}`}
                position={position}
                piece={piece}
                animatingPiece={animatingPieceAtPosition?.piece || null}
                isSelected={isSelected(position)}
                isValidMove={isValidMove(position)}
                isRiverRow={row === 4 || row === 5}
                isPalacePosition={isPalacePosition(position)}
                onClick={() => onSquareClick(position)}
                theme={theme}
              />
            )
          })
        )}
          </div>

          {/* 河界标记 */}
          <div className="river-divider absolute inset-0 pointer-events-none">
            <div className="river-text">
              <span className="text-gold-600 font-bold text-lg tracking-wider">楚河</span>
              <span className="mx-4 text-gray-600">◆◆◆◆◆</span>
              <span className="text-gold-600 font-bold text-lg tracking-wider">汉界</span>
            </div>
          </div>

          {/* 装饰性角落图案 */}
          <div className="board-corners">
            <div className="corner corner-tl"></div>
            <div className="corner corner-tr"></div>
            <div className="corner corner-bl"></div>
            <div className="corner corner-br"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 判断位置是否在九宫格内
 */
const isPalacePosition = (position: Position): boolean => {
  const { row, col } = position
  
  // 红方九宫格 (行 7-9, 列 3-5)
  if (row >= 7 && row <= 9 && col >= 3 && col <= 5) {
    return true
  }
  
  // 黑方九宫格 (行 0-2, 列 3-5)
  if (row >= 0 && row <= 2 && col >= 3 && col <= 5) {
    return true
  }
  
  return false
}

export default ChessBoard