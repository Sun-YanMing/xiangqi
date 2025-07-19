import { useEffect, useState } from 'react'
import ChessBoard from './components/ChessBoard'
import GameInfoPanel from './components/GameInfoPanel'
import GameSettings from './components/GameSettings'
import DevTools from './components/DevTools'
import { useChessGame } from './hooks/useChessGame'
import { Inspector } from 'react-dev-inspector'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/chess3d.css'

// 包装器组件，仅在开发环境启用 Inspector
const InspectorWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (process.env.NODE_ENV === 'development') {
    return <Inspector>{children}</Inspector>
  }
  return <>{children}</>
}

/**
 * 象棋游戏主应用组件
 */
function App() {
  const {
    gameState,
    isAIThinking,
    handleSquareClick,
    resetGame,
    undoMove,
    setGameMode,
    setTheme,
    getGameInfo
  } = useChessGame()

  const gameInfo = getGameInfo()
  const [showSettings, setShowSettings] = useState(false)

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'n':
            event.preventDefault()
            resetGame()
            break
          case 'z':
            event.preventDefault()
            if (gameInfo.canUndo) {
              undoMove()
            }
            break
          case ',':
            event.preventDefault()
            setShowSettings(true)
            break
          default:
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [resetGame, undoMove, gameInfo.canUndo])

  return (
    <InspectorWrapper>
      <div className="h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">象</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">中国象棋</h1>
          </div>
          
          {/* AI思考状态指示器 */}
          {isAIThinking && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">AI思考中</span>
            </div>
          )}
          
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="设置 (Ctrl+,)"
          >
            <span className="i-tabler-settings w-5 h-5 text-gray-600">⚙️</span>
          </button>
        </header>

        {/* 游戏主体区域 - 响应式布局 */}
        <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
          {/* 棋盘区域 */}
          <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
            <ChessBoard
              gameState={gameState}
              onSquareClick={handleSquareClick}
            />
          </div>

          {/* 信息面板 - 移动端底部，桌面端右侧 */}
          <div className="w-full h-48 border-t lg:w-80 lg:h-full lg:border-t-0 lg:border-l border-gray-200/50 bg-white/80 backdrop-blur-sm">
            <GameInfoPanel
              statusText={gameInfo.statusText}
              moveCount={gameInfo.moveCount}
              canUndo={gameInfo.canUndo}
              gameOver={gameInfo.gameOver}
              gameMode={gameState.gameMode}
              theme={gameState.theme}
              isInCheck={gameState.isInCheck}
              capturedPieces={gameState.capturedPieces}
              moves={gameState.moveHistory}
              onResetGame={resetGame}
              onUndoMove={undoMove}
              onGameModeChange={setGameMode}
              onThemeChange={setTheme}
            />
          </div>
        </div>

        {/* 设置模态框 */}
        <GameSettings
          gameMode={gameState.gameMode}
          theme={gameState.theme}
          isOpen={showSettings}
          onGameModeChange={setGameMode}
          onThemeChange={setTheme}
          onClose={() => setShowSettings(false)}
        />

        {/* 开发工具 (仅开发环境) */}
        <DevTools 
          gameState={gameState}
          isAIThinking={isAIThinking}
        />
      </div>
    </InspectorWrapper>
  )
}

export default App
