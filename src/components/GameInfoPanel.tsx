import React, { useState } from 'react'
import type { GameMode, Theme, ChessPiece, Move } from '../types/chess'
import { PIECE_NAMES } from '../types/chess'

interface GameInfoPanelProps {
  statusText: string
  moveCount: number
  canUndo: boolean
  gameOver: boolean
  gameMode: GameMode
  theme: Theme
  isInCheck: boolean
  isFlyingGenerals: boolean
  capturedPieces: {
    red: ChessPiece[]
    black: ChessPiece[]
  }
  moves: Move[]
  onResetGame: () => void
  onUndoMove: () => void
  onGameModeChange?: (mode: GameMode) => void
  onThemeChange?: (theme: Theme) => void
  onMoveClick?: (moveIndex: number) => void
}

type TabType = 'game' | 'history' | 'captured'

/**
 * 游戏信息面板组件
 * 使用标签页形式组织游戏状态、棋谱记录、被吃棋子等信息
 */
const GameInfoPanel: React.FC<GameInfoPanelProps> = ({
  statusText,
  moveCount,
  canUndo,
  gameOver: _gameOver, // 重命名未使用的参数
  gameMode,
  theme,
  isInCheck,
  isFlyingGenerals,
  capturedPieces,
  moves,
  onResetGame,
  onUndoMove,
  onGameModeChange,
  onThemeChange,
  onMoveClick
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('game')

  /**
   * 游戏模式选项
   */
  const gameModeOptions: { value: GameMode; label: string, description?: string }[] = [
    { value: 'pvp', label: '双人对战', description: '本地双人游戏' },
    { value: 'ai-easy', label: 'AI入门', description: '适合新手，思考较浅' },
    { value: 'ai-medium', label: 'AI业余', description: '中等难度，有一定挑战' },
    { value: 'ai-hard', label: 'AI专业', description: '较强棋力，深度思考' },
    { value: 'ai-expert', label: 'AI大师', description: '顶级棋力，专家级算法' }
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
      return <div className="text-gray-400 text-xs text-center py-3">暂无损失</div>
    }

    return (
      <div className="grid grid-cols-5 gap-1">
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
            {PIECE_NAMES[piece.color][piece.type]}
          </div>
        ))}
      </div>
    )
  }

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

  /**
   * 渲染棋谱记录
   */
  const renderMoveHistory = () => {
    if (moves.length === 0) {
      return <div className="text-gray-400 text-sm text-center py-4">暂无棋步记录</div>
    }

    // 将移动按回合分组
    const rounds = []
    for (let i = 0; i < moves.length; i += 2) {
      const redMove = moves[i]
      const blackMove = moves[i + 1]
      rounds.push({ red: redMove, black: blackMove })
    }

    return (
      <div className="space-y-1">
        {rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="text-xs">
            {/* 回合数标题 */}
            <div className="flex items-center text-gray-500 mb-1">
              <span className="w-4 text-center font-medium">{roundIndex + 1}</span>
              <span className="ml-1">回合</span>
            </div>
            
            <div className="ml-5 space-y-1">
              {/* 红方移动 */}
              <div 
                className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-50 ${getMoveColorClass(round.red)}`}
                onClick={() => onMoveClick?.(roundIndex * 2)}
                title={`红方: ${formatMove(round.red)}`}
              >
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                <span className="flex-1 text-xs">{formatMove(round.red)}</span>
              </div>
              
              {/* 黑方移动 */}
              {round.black && (
                <div 
                  className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-50 ${getMoveColorClass(round.black)}`}
                  onClick={() => onMoveClick?.(roundIndex * 2 + 1)}
                  title={`黑方: ${formatMove(round.black)}`}
                >
                  <span className="w-2 h-2 bg-gray-700 rounded-full mr-2"></span>
                  <span className="flex-1 text-xs">{formatMove(round.black)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 顶部状态栏 */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">游戏状态</span>
          <div className={`w-2 h-2 rounded-full ${isInCheck ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
        </div>
        <p className="text-sm text-gray-800 font-medium">{statusText}</p>
        <p className="text-xs text-gray-500 mt-1">第 {moveCount} 回合</p>
      </div>

      {/* 快速操作按钮 */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onResetGame}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <span className="i-tabler-refresh mr-1"></span>
            重新开始
          </button>
          <button
            onClick={onUndoMove}
            disabled={!canUndo}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <span className="i-tabler-arrow-back-up mr-1"></span>
            悔棋
          </button>
        </div>
      </div>

      {/* 标签页导航 - 紧凑版 */}
      <div className="border-b border-gray-200/50">
        <nav className="flex">
          {[
            { id: 'game', label: '设置', icon: 'i-tabler-settings' },
            { id: 'history', label: '棋谱', icon: 'i-tabler-list', badge: moves.length },
            { id: 'captured', label: '损失', icon: 'i-tabler-trophy', badge: capturedPieces.red.length + capturedPieces.black.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                flex-1 py-3 px-2 text-xs font-medium border-b-2 transition-colors relative
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <span className={`${tab.icon} text-sm mb-1`}></span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* 标签页内容 - 使用flex-1占满剩余空间 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'game' && (
          <div className="space-y-4">
            {/* 游戏模式 */}
            {onGameModeChange && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">游戏模式</label>
                <select
                  value={gameMode}
                  onChange={(e) => onGameModeChange(e.target.value as GameMode)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {gameModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 主题选择 */}
            {onThemeChange && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">棋盘主题</label>
                <div className="grid grid-cols-2 gap-2">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onThemeChange(option.value)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        theme === option.value
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 游戏快捷键说明 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">快捷键</label>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>重新开始</span>
                  <span className="font-mono">Ctrl+N</span>
                </div>
                <div className="flex justify-between">
                  <span>悔棋</span>
                  <span className="font-mono">Ctrl+Z</span>
                </div>
                <div className="flex justify-between">
                  <span>设置</span>
                  <span className="font-mono">Ctrl+,</span>
                </div>
              </div>
            </div>

            {/* 将军提示 */}
            {isInCheck && (
              <div className="p-2 bg-red-50 rounded text-sm text-red-700">
                <strong>将军！</strong>必须解除将军状态
              </div>
            )}

            {/* 双将对脸警告 */}
            {isFlyingGenerals && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <strong>⚠️ 双将对脸！</strong>此局面违反象棋规则
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-700">棋谱记录</span>
              <span className="text-xs text-gray-500">
                {Math.floor(moves.length / 2)} 回合
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {renderMoveHistory()}
            </div>
          </div>
        )}

        {activeTab === 'captured' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  红方损失
                </span>
                <span className="text-xs text-gray-500">{capturedPieces.red.length} 枚</span>
              </div>
              {renderCapturedPieces(capturedPieces.red, 'red')}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-gray-700 rounded-full mr-2"></span>
                  黑方损失
                </span>
                <span className="text-xs text-gray-500">{capturedPieces.black.length} 枚</span>
              </div>
              {renderCapturedPieces(capturedPieces.black, 'black')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameInfoPanel