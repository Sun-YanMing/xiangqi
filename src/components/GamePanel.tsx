import React from 'react'
import type { GameMode, Theme, ChessPiece } from '../types/chess'
import { PIECE_NAMES } from '../types/chess'

interface GamePanelProps {
  statusText: string
  moveCount: number
  canUndo: boolean
  gameOver: boolean
  gameMode: GameMode
  theme: Theme
  isInCheck: boolean
  capturedPieces: {
    red: ChessPiece[]
    black: ChessPiece[]
  }
  onResetGame: () => void
  onUndoMove: () => void
  onGameModeChange?: (mode: GameMode) => void
  onThemeChange?: (theme: Theme) => void
}

/**
 * 游戏控制面板组件
 * 显示游戏状态、控制按钮、被吃棋子等信息
 */
const GamePanel: React.FC<GamePanelProps> = ({
  statusText,
  moveCount,
  canUndo,
  gameOver,
  gameMode,
  theme,
  isInCheck,
  capturedPieces,
  onResetGame,
  onUndoMove
}) => {
  /**
   * 游戏模式选项
   */
  const gameModeOptions: { value: GameMode; label: string }[] = [
    { value: 'pvp', label: '双人对战' },
    { value: 'ai-easy', label: 'AI简单' },
    { value: 'ai-medium', label: 'AI中等' },
    { value: 'ai-hard', label: 'AI困难' }
  ]

  /**
   * 主题选项
   */
  const themeOptions: { value: Theme; label: string }[] = [
    { value: 'classic', label: '经典' },
    { value: 'modern', label: '现代' },
    { value: 'wooden', label: '木质' },
    { value: 'marble', label: '大理石' }
  ]

  /**
   * 渲染被吃棋子
   */
  const renderCapturedPieces = (pieces: ChessPiece[], color: 'red' | 'black') => {
    if (pieces.length === 0) {
      return <div className="text-gray-400 text-sm">无</div>
    }

    return (
      <div className="flex flex-wrap gap-1">
        {pieces.map((piece, index) => (
          <div
            key={`${piece.id}-${index}`}
            className={`
              w-8 h-8 rounded-full flex-center text-xs font-bold border
              ${color === 'red' 
                ? 'bg-red-500 text-white border-red-600' 
                : 'bg-gray-700 text-white border-gray-800'
              }
            `}
            title={`${color === 'red' ? '红' : '黑'}${PIECE_NAMES[piece.color][piece.type]}`}
          >
            {/* 显示中文棋子名称 */}
            {PIECE_NAMES[piece.color][piece.type]}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-80 p-4 bg-white rounded-lg shadow-lg">
      {/* 游戏状态 */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">象棋游戏</h2>
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-semibold text-blue-800">{statusText}</div>
          <div className="text-sm text-blue-600">第 {Math.floor(moveCount / 2) + 1} 回合</div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="mb-4 space-y-2">
        <button
          onClick={onResetGame}
          className="btn-primary w-full"
        >
          <span className="i-tabler-refresh mr-2" />
          重新开始
        </button>
        
        <button
          onClick={onUndoMove}
          disabled={!canUndo || gameOver}
          className="btn-secondary w-full disabled:opacity-50"
        >
          <span className="i-tabler-arrow-back-up mr-2" />
          悔棋
        </button>
      </div>

      {/* 当前模式显示 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-1">当前模式</div>
        <div className="font-medium">
          {gameModeOptions.find(mode => mode.value === gameMode)?.label}
        </div>
        <div className="text-sm text-gray-600 mt-1">主题: {themeOptions.find(t => t.value === theme)?.label}</div>
      </div>

      {/* 被吃棋子展示 */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            红方损失棋子 ({capturedPieces.red.length})
          </h3>
          {renderCapturedPieces(capturedPieces.red, 'red')}
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <span className="w-3 h-3 bg-gray-700 rounded-full mr-2"></span>
            黑方损失棋子 ({capturedPieces.black.length})
          </h3>
          {renderCapturedPieces(capturedPieces.black, 'black')}
        </div>
      </div>

      {/* 游戏规则提示 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">操作提示</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 点击棋子选择，再点击目标位置移动</li>
          <li>• 绿色圆点表示可移动位置</li>
          <li>• 红方先行，轮流行棋</li>
          <li>• 将军时必须应将</li>
          <li>• Ctrl+N 重新开始，Ctrl+Z 悔棋</li>
        </ul>
        
        {/* 当前游戏提示 */}
        {gameMode !== 'pvp' && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
            <strong>AI模式：</strong>您执红棋，AI执黑棋
          </div>
        )}
        
        {isInCheck && (
          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
            <strong>将军！</strong>必须解除将军状态
          </div>
        )}
      </div>
    </div>
  )
}

export default GamePanel