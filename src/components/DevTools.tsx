import React, { useState, useEffect } from 'react'
import type { GameState } from '../types/chess'

interface DevToolsProps {
  gameState: GameState
  isAIThinking: boolean
  onGameStateChange?: (newState: Partial<GameState>) => void
}

/**
 * 开发调试工具组件
 * 仅在开发环境中显示，提供游戏状态查看和调试功能
 */
const DevTools: React.FC<DevToolsProps> = ({ 
  gameState, 
  isAIThinking
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'state' | 'board' | 'moves'>('state')

  // ESC键关闭DevTools
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // 仅在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  /**
   * 渲染棋盘状态
   */
  const renderBoardState = () => {
    return (
      <div className="space-y-2">
        <h4 className="font-medium">棋盘状态 (10x9)</h4>
        <div className="text-xs font-mono bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
          {gameState.board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              <span className="w-4 text-gray-500">{rowIndex}:</span>
              {row.map((piece, colIndex) => (
                <span key={colIndex} className="w-8 text-center">
                  {piece ? `${piece.color[0]}${piece.type[0]}` : '--'}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  /**
   * 渲染移动历史
   */
  const renderMoveHistory = () => {
    return (
      <div className="space-y-2">
        <h4 className="font-medium">移动历史 ({gameState.moveHistory.length} 步)</h4>
        <div className="max-h-40 overflow-y-auto text-xs font-mono bg-gray-900 text-green-400 p-2 rounded">
          {gameState.moveHistory.length === 0 ? (
            <div className="text-gray-500">暂无移动记录</div>
          ) : (
            gameState.moveHistory.map((move, index) => (
              <div key={`${move.timestamp}-${index}`} className="flex items-center gap-2">
                <span className="w-6 text-gray-500">{index + 1}.</span>
                <span className={move.piece.color === 'red' ? 'text-red-400' : 'text-blue-400'}>
                  {move.piece.color} {move.piece.type}
                </span>
                <span className="text-gray-400">
                  ({move.from.row},{move.from.col}) → ({move.to.row},{move.to.col})
                </span>
                {move.capturedPiece && (
                  <span className="text-yellow-400">
                    吃 {move.capturedPiece.color} {move.capturedPiece.type}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  /**
   * 渲染游戏状态信息
   */
  const renderGameState = () => {
    return (
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-medium text-gray-600">当前玩家</div>
            <div className={`font-bold ${gameState.currentPlayer === 'red' ? 'text-red-600' : 'text-gray-800'}`}>
              {gameState.currentPlayer === 'red' ? '红方' : '黑方'}
            </div>
          </div>
          
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-medium text-gray-600">游戏状态</div>
            <div className="font-bold">
              {gameState.gameStatus}
            </div>
          </div>
          
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-medium text-gray-600">游戏模式</div>
            <div className="font-bold">
              {gameState.gameMode}
            </div>
          </div>
          
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-medium text-gray-600">AI状态</div>
            <div className={`font-bold ${isAIThinking ? 'text-orange-600' : 'text-green-600'}`}>
              {isAIThinking ? '思考中' : '空闲'}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-2 rounded">
          <div className="font-medium text-gray-600 mb-1">选中位置</div>
          <div className="font-mono text-xs">
            {gameState.selectedPosition 
              ? `(${gameState.selectedPosition.row}, ${gameState.selectedPosition.col})`
              : '无选择'
            }
          </div>
        </div>

        <div className="bg-gray-50 p-2 rounded">
          <div className="font-medium text-gray-600 mb-1">可移动位置</div>
          <div className="font-mono text-xs max-h-20 overflow-y-auto">
            {gameState.validMoves.length === 0 ? '无' : 
              gameState.validMoves.map((pos) => `(${pos.row},${pos.col})`).join(' ')
            }
          </div>
        </div>

        <div className="bg-gray-50 p-2 rounded">
          <div className="font-medium text-gray-600 mb-1">特殊状态</div>
          <div className="space-y-1 text-xs">
            <div className={`font-bold ${gameState.isInCheck ? 'text-red-600' : 'text-green-600'}`}>
              将军: {gameState.isInCheck ? '是' : '否'}
            </div>
            {gameState.winner && (
              <div className="font-bold text-blue-600">
                获胜方: {gameState.winner}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-2 rounded">
          <div className="font-medium text-gray-600 mb-1">被吃棋子</div>
          <div className="text-xs">
            <div>红方损失: {gameState.capturedPieces.red.length} 个</div>
            <div>黑方损失: {gameState.capturedPieces.black.length} 个</div>
          </div>
        </div>

        <div className="bg-gray-50 p-2 rounded">
          <div className="font-medium text-gray-600 mb-1">动画中棋子</div>
          <div className="text-xs font-mono">
            {gameState.animatingPieces.length === 0 ? '无' :
              gameState.animatingPieces.map((ap) => 
                `${ap.piece.color}${ap.piece.type}@(${ap.position.row},${ap.position.col})`
              ).join(', ')
            }
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 z-50 group"
        title="打开开发工具 (开发环境)"
      >
        <span className="i-tabler-code text-xl group-hover:rotate-12 transition-transform duration-300">🔧</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 关闭按钮 - 外部 */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute -top-2 -left-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm z-10 shadow-lg transition-all duration-200"
        title="关闭开发工具"
      >
        ×
      </button>
      
      <div className="w-96 max-h-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <span className="i-tabler-code text-lg">🔧</span>
          <span className="font-semibold">开发工具</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition-all duration-200 flex-shrink-0"
          title="关闭开发工具"
        >
          <span className="i-tabler-x text-lg font-bold"></span>
        </button>
      </div>

      {/* 标签页导航 */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {[
          { key: 'state', label: '状态', icon: 'i-tabler-dashboard' },
          { key: 'board', label: '棋盘', icon: 'i-tabler-grid-dots' },
          { key: 'moves', label: '移动', icon: 'i-tabler-list-details' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <span className={`${tab.icon} text-sm`}></span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="p-3 overflow-y-auto max-h-72">
        {activeTab === 'state' && renderGameState()}
        {activeTab === 'board' && renderBoardState()}
        {activeTab === 'moves' && renderMoveHistory()}
      </div>
      </div>
    </div>
  )
}

export default DevTools