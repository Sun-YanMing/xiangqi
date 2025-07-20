import React from 'react'
import type { ChessPiece, Position, GameState } from '../types/chess'
import { PIECE_NAMES } from '../types/chess'
import { useTheme } from '../hooks/useTheme'

interface ThemedChessBoardProps {
  gameState: GameState
  onSquareClick: (position: Position) => void
  isAIThinking: boolean
}

/**
 * 主题化象棋棋盘组件
 * 支持多种视觉主题和动态样式切换
 */
const ThemedChessBoard: React.FC<ThemedChessBoardProps> = ({
  gameState,
  onSquareClick,
  isAIThinking
}) => {
  const { board, selectedPosition, validMoves, animatingPieces } = gameState
  const { themeConfig } = useTheme()

  /**
   * 检查位置是否是有效移动
   */
  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col)
  }

  /**
   * 检查位置是否被选中
   */
  const isSelected = (row: number, col: number): boolean => {
    return selectedPosition?.row === row && selectedPosition?.col === col
  }

  /**
   * 获取棋子的主题化样式类名和样式
   */
  const getPieceStyle = (piece: ChessPiece, isSelected: boolean) => {
    const baseStyle = {
      background: piece.color === 'red' 
        ? themeConfig.colors.redPiece.background 
        : themeConfig.colors.blackPiece.background,
      borderColor: piece.color === 'red' 
        ? themeConfig.colors.redPiece.border 
        : themeConfig.colors.blackPiece.border,
      color: piece.color === 'red' 
        ? themeConfig.colors.redPiece.text 
        : themeConfig.colors.blackPiece.text,
      boxShadow: isSelected 
        ? `0 0 25px ${themeConfig.colors.selected}` 
        : `0 4px 15px ${piece.color === 'red' ? themeConfig.colors.redPiece.shadow : themeConfig.colors.blackPiece.shadow}`,
      transform: isSelected ? 'translateY(-3px) scale(1.08)' : 'translateY(0) scale(1)'
    }
    
    return {
      className: `themed-chess-piece flex-center w-12 h-12 border-3 rounded-full font-bold text-lg transition-all duration-300 cursor-pointer ${
        piece.color === 'red' ? '' : 'black'
      } ${
        isSelected ? 'selected' : ''
      }`,
      style: baseStyle
    }
  }

  /**
   * 获取格子的主题化样式
   */
  const getSquareStyle = (row: number, col: number) => {
    const isValid = isValidMove(row, col)
    const isRiver = row === 4 || row === 5
    
    const style = {
      backgroundColor: isValid 
        ? themeConfig.colors.validMove 
        : isRiver 
          ? themeConfig.colors.boardMedium 
          : (row + col) % 2 === 0 
            ? themeConfig.colors.boardLight 
            : themeConfig.colors.boardMedium,
      borderColor: themeConfig.colors.boardBorder
    }
    
    return {
      className: `themed-square w-16 h-16 flex-center relative cursor-pointer border transition-all duration-200 hover:bg-opacity-80 ${
        isValid ? 'themed-valid-move' : ''
      }`,
      style
    }
  }

  /**
   * 渲染棋子
   */
  const renderPiece = (piece: ChessPiece | null, row: number, col: number) => {
    if (!piece) return null

    const isCurrentSelected = isSelected(row, col)
    const pieceText = PIECE_NAMES[piece.color][piece.type]
    const { className, style } = getPieceStyle(piece, isCurrentSelected)
    
    return (
      <div 
        className={className}
        style={{
          ...style,
          // 添加棋子特殊效果
          filter: isAIThinking && piece.color === 'black' ? 'brightness(0.7)' : 'brightness(1)',
        }}
      >
        {pieceText}
      </div>
    )
  }

  /**
   * 渲染动画中的棋子
   */
  const renderAnimatingPieces = () => {
    return animatingPieces.map((animPiece, index) => {
      const { className, style } = getPieceStyle(animPiece.piece, false)
      return (
        <div
          key={`anim-${animPiece.piece.id}-${index}`}
          className={className}
          style={{
            ...style,
            position: 'absolute',
            left: `${animPiece.position.col * 64 + 32}px`, // 64px = w-16, 32px = 偏移
            top: `${animPiece.position.row * 64 + 32}px`,
            zIndex: 1000,
            opacity: 0.8,
            animation: 'theme-transition 0.5s ease-out forwards'
          }}
        >
          {PIECE_NAMES[animPiece.piece.color][animPiece.piece.type]}
        </div>
      )
    })
  }

  return (
    <div 
      className="themed-chess-board relative"
      style={{
        background: themeConfig.colors.surface,
        borderColor: themeConfig.colors.boardBorder
      }}
    >
      {/* 棋盘网格 */}
      <div className="grid grid-cols-9 gap-0 relative">
        {Array.from({ length: 10 }, (_, row) =>
          Array.from({ length: 9 }, (_, col) => {
            const { className, style } = getSquareStyle(row, col)
            return (
              <div
                key={`${row}-${col}`}
                className={className}
                style={{
                  ...style,
                  pointerEvents: isAIThinking ? 'none' : 'auto'
                }}
                onClick={() => !isAIThinking && onSquareClick({ row, col })}
              >
                {renderPiece(board[row][col], row, col)}
              </div>
            )
          })
        )}
      </div>

      {/* 渲染动画中的棋子 */}
      {renderAnimatingPieces()}

      {/* 主题化棋盘装饰 */}
      <div className="absolute -top-4 -left-4 -right-4 -bottom-4 pointer-events-none">
        {/* 四角装饰 */}
        <div 
          className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 rounded-tl-lg"
          style={{ borderColor: themeConfig.colors.accent }}
        ></div>
        <div 
          className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 rounded-tr-lg"
          style={{ borderColor: themeConfig.colors.accent }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 rounded-bl-lg"
          style={{ borderColor: themeConfig.colors.accent }}
        ></div>
        <div 
          className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 rounded-br-lg"
          style={{ borderColor: themeConfig.colors.accent }}
        ></div>
      </div>

      {/* AI思考遮罩 */}
      {isAIThinking && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex-center rounded-lg">
          <div 
            className="themed-btn px-4 py-2 pointer-events-none"
            style={{ backgroundColor: themeConfig.colors.accent }}
          >
            <span className="inline-block animate-spin mr-2">⚙</span>
            <span style={{ color: themeConfig.colors.textPrimary }}>AI思考中...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemedChessBoard