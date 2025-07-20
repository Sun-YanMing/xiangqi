import { useEffect, useState } from 'react'
import ThemedChessBoard from './components/VintageChessBoard'
import GameInfoPanel from './components/GameInfoPanel'
import GameSettings from './components/GameSettings'
import VictoryOverlay from './components/VictoryOverlay'
import DevTools from './components/DevTools'
import { useChessGame } from './hooks/useChessGame'
import { useTheme } from './hooks/useTheme'
import { playBackgroundMusic, soundManager } from './utils/soundEffects'
import { Inspector } from 'react-dev-inspector'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/chess3d.css'
import './styles/vintage.css'
import './styles/themes.css'

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
    getGameInfo
  } = useChessGame()

  const { currentTheme, changeTheme, themeConfig } = useTheme()
  const gameInfo = getGameInfo()
  const [showSettings, setShowSettings] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  // 用户交互触发背景音乐
  const handleUserInteraction = async () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true)
      // 检查背景音乐是否开启
      if (soundManager.isBackgroundMusicEnabled()) {
        try {
          await playBackgroundMusic('game')
          console.log('🎵 用户交互触发背景音乐播放')
        } catch (error) {
          console.warn('背景音乐播放失败:', error)
        }
      }
    }
  }

  // 包装棋盘点击事件
  const handleSquareClickWithMusic = async (position: any) => {
    await handleUserInteraction()
    handleSquareClick(position)
  }

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // 任何键盘交互都触发背景音乐
      handleUserInteraction()
      
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
  }, [resetGame, undoMove, gameInfo.canUndo, hasUserInteracted])

  return (
    <InspectorWrapper>
      <div className="themed-chess-board h-screen overflow-hidden" data-theme={currentTheme}>
        {/* 主题化顶部标题栏 */}
        <header 
          className="h-20 px-6 flex items-center justify-between themed-info-panel border-b-4"
          style={{ borderColor: themeConfig.colors.primary }}
        >
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 themed-chess-piece flex-center text-xl font-bold"
              style={{
                background: themeConfig.colors.redPiece.background,
                borderColor: themeConfig.colors.redPiece.border,
                color: themeConfig.colors.redPiece.text
              }}
            >
              {themeConfig.icon}
            </div>
            <h1 
              className="themed-title text-3xl font-bold"
              style={{ color: themeConfig.colors.textAccent }}
            >
              中国象棋
            </h1>
          </div>
          
          {/* AI思考状态指示器 */}
          {isAIThinking && (
            <div 
              className="flex items-center space-x-3 themed-btn px-4 py-2"
              style={{ backgroundColor: themeConfig.colors.accent }}
            >
              <div 
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: themeConfig.colors.selected }}
              ></div>
              <span className="font-medium" style={{ color: themeConfig.colors.textPrimary }}>
                AI思考中
              </span>
            </div>
          )}
          
          <button
            onClick={async () => {
              await handleUserInteraction()
              setShowSettings(true)
            }}
            className="themed-btn p-3 text-lg"
            title="设置 (Ctrl+,)"
          >
            ⚙️
          </button>
        </header>

        {/* 游戏主体区域 - 复古布局 */}
        <div className="h-[calc(100vh-5rem)] flex flex-col lg:flex-row p-6 gap-6">
          {/* 棋盘区域 */}
          <div className="flex-1 flex items-center justify-center">
            <ThemedChessBoard
              gameState={gameState}
              onSquareClick={handleSquareClickWithMusic}
              isAIThinking={isAIThinking}
            />
          </div>

          {/* 信息面板 - 主题化风格 */}
          <div className="w-full h-48 lg:w-80 lg:h-full themed-info-panel">
            <GameInfoPanel
              statusText={gameInfo.statusText}
              moveCount={gameInfo.moveCount}
              canUndo={gameInfo.canUndo}
              gameOver={gameInfo.gameOver}
              gameMode={gameState.gameMode}
              theme={currentTheme}
              isInCheck={gameState.isInCheck}
              isFlyingGenerals={gameState.isFlyingGenerals}
              capturedPieces={gameState.capturedPieces}
              moves={gameState.moveHistory}
              onResetGame={resetGame}
              onUndoMove={undoMove}
              onGameModeChange={setGameMode}
              onThemeChange={changeTheme}
            />
          </div>
        </div>

        {/* 设置模态框 */}
        <GameSettings
          gameMode={gameState.gameMode}
          theme={currentTheme}
          isOpen={showSettings}
          onGameModeChange={setGameMode}
          onThemeChange={changeTheme}
          onClose={() => setShowSettings(false)}
        />

        {/* 胜利特效叠加层 */}
        <VictoryOverlay
          winner={gameState.winner}
          gameOver={gameInfo.gameOver}
          onRestart={resetGame}
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
