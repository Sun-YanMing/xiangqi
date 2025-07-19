import React from 'react'
import type { ChessPiece, Theme } from '../types/chess'
import { PIECE_NAMES } from '../types/chess'

interface ChessPieceComponentProps {
  piece: ChessPiece
  isSelected: boolean
  theme: Theme
}

/**
 * 象棋棋子组件
 * 渲染单个棋子，包含中文字符、颜色和主题样式
 */
const ChessPieceComponent: React.FC<ChessPieceComponentProps> = ({
  piece,
  isSelected,
  theme
}) => {
  /**
   * 获取棋子显示文字
   */
  const getPieceText = (): string => {
    return PIECE_NAMES[piece.color][piece.type]
  }

  /**
   * 获取棋子样式类名
   */
  const getPieceClasses = (): string => {
    let classes = 'chess-piece-3d transform-gpu transition-all duration-300 hover:scale-110 cursor-pointer'
    
    // 基础3D样式
    classes += ' piece-base'
    
    // 颜色样式
    if (piece.color === 'red') {
      classes += ' piece-red'
    } else {
      classes += ' piece-black'
    }
    
    // 选中状态
    if (isSelected) {
      classes += ' piece-selected'
    }
    
    // 主题样式调整
    const themeClasses = {
      classic: `piece-theme-classic`,
      modern: `piece-theme-modern`,
      wooden: `piece-theme-wooden`,
      marble: `piece-theme-marble`
    }
    
    classes += ` ${themeClasses[theme]}`
    
    return classes
  }

  /**
   * 获取3D样式
   */
  const get3DPieceStyles = (): React.CSSProperties => {
    const baseScale = isSelected ? 1.15 : 1
    return {
      transform: `translateZ(5px) scale(${baseScale})`,
      transformStyle: 'preserve-3d',
      boxShadow: isSelected 
        ? `0 15px 30px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.2)`
        : `0 8px 16px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
      background: piece.color === 'red' 
        ? 'linear-gradient(145deg, #dc2626, #991b1b, #7f1d1d)'
        : 'linear-gradient(145deg, #374151, #1f2937, #111827)',
      filter: isSelected ? 'brightness(1.1)' : 'brightness(1)'
    }
  }

  /**
   * 获取棋子字体大小样式
   */
  const getFontSizeClass = (): string => {
    // 根据棋子类型调整字体大小
    const fontSizes = {
      king: 'text-base font-black',
      advisor: 'text-sm font-bold',
      elephant: 'text-sm font-bold',
      horse: 'text-sm font-bold',
      chariot: 'text-sm font-bold',
      cannon: 'text-sm font-bold',
      soldier: 'text-xs font-bold'
    }
    
    return fontSizes[piece.type]
  }

  return (
    <div
      className={getPieceClasses()}
      style={get3DPieceStyles()}
      title={`${piece.color === 'red' ? '红' : '黑'}${getPieceText()}`}
      data-piece-id={piece.id}
      data-piece-type={piece.type}
      data-piece-color={piece.color}
    >
      {/* 棋子顶面 */}
      <div className="piece-top">
        <span className={`${getFontSizeClass()} select-none piece-text`}>
          {getPieceText()}
        </span>
      </div>
      
      {/* 棋子侧面 */}
      <div className="piece-side piece-side-front"></div>
      <div className="piece-side piece-side-back"></div>
      <div className="piece-side piece-side-left"></div>
      <div className="piece-side piece-side-right"></div>
      
      {/* 棋子底面 */}
      <div className="piece-bottom"></div>
      
      {/* 高光效果 */}
      <div className="piece-highlight"></div>
      
      {/* 选中状态发光效果 */}
      {isSelected && (
        <>
          <div className="piece-glow piece-glow-pulse"></div>
          <div className="piece-selection-ring"></div>
        </>
      )}
      
      {/* 棋子内部装饰 */}
      <div className="piece-decoration">
        {/* 根据棋子类型添加特殊装饰 */}
        {piece.type === 'king' && <div className="king-crown"></div>}
        {piece.type === 'advisor' && <div className="advisor-symbol"></div>}
        {piece.type === 'elephant' && <div className="elephant-pattern"></div>}
      </div>
    </div>
  )
}

export default ChessPieceComponent