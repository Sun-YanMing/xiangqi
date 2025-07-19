import { useState, useCallback, useEffect, useRef } from 'react'
import type { 
  GameState, 
  Position, 
  Move, 
  PieceColor, 
  GameMode,
  Theme
} from '../types/chess'
import { createInitialBoard, cloneBoard } from '../utils/boardUtils'
import { getValidMoves, isValidMove, isInCheck, isCheckmate } from '../utils/moveValidation'
import { AIEngine, AI_DIFFICULTIES } from '../utils/aiEngine'
import { playSound, playCheckSound, playVictorySound } from '../utils/soundEffects'
import { animationManager } from '../utils/animationManager'
import { useGameStore, getGameDuration, serializeBoard } from '../stores/gameStore'

/**
 * 象棋游戏主要逻辑 Hook
 * 管理游戏状态、棋子移动、规则验证等核心功能
 */
export const useChessGame = () => {
  // 游戏存储
  const gameStore = useGameStore()
  
  // 游戏开始时间
  const [gameStartTime] = useState<Date>(new Date())
  
  // 初始游戏状态
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 'red', // 红方先行
    gameStatus: 'playing',
    gameMode: gameStore.settings.aiDifficulty === 'easy' ? 'ai-easy' : 
             gameStore.settings.aiDifficulty === 'medium' ? 'ai-medium' : 
             gameStore.settings.aiDifficulty === 'hard' ? 'ai-hard' : 'pvp',
    selectedPosition: null,
    validMoves: [],
    moveHistory: [],
    capturedPieces: { red: [], black: [] },
    theme: gameStore.settings.theme,
    isInCheck: false,
    winner: null,
    animatingPieces: []
  })

  // AI思考状态
  const [isAIThinking, setIsAIThinking] = useState(false)
  
  // 操作锁状态，防止竞态条件
  const [operationLock, setOperationLock] = useState(false)
  
  // AI定时器引用，用于清理延迟触发的AI移动
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 处理棋格点击事件
   */
  const handleSquareClick = useCallback(async (position: Position): Promise<void> => {
    // 防止重复操作
    if (operationLock) return
    
    const { board, currentPlayer, selectedPosition, gameStatus, gameMode } = gameState
    
    // 游戏结束时不允许移动
    if (gameStatus !== 'playing') return
    
    // AI思考时不允许玩家移动
    if (isAIThinking) return
    
    // AI模式下黑方轮次时不允许玩家操作
    if (gameMode !== 'pvp' && currentPlayer === 'black') return
    
    setOperationLock(true)
    
    const clickedPiece = board[position.row][position.col]
    
    if (!selectedPosition) {
      // 没有选中棋子时，选择棋子
      if (clickedPiece && clickedPiece.color === currentPlayer) {
        const validMoves = getValidMoves(board, clickedPiece, position)
        
        // 播放选择音效
        playSound('select')
        
        // 播放选择动画
        animationManager.animatePieceSelect(clickedPiece.id)
        
        // 高亮有效移动位置
        validMoves.forEach(move => {
          animationManager.animateSquareHighlight(move.row, move.col, 'valid')
        })
        
        setGameState(prev => ({
          ...prev,
          selectedPosition: position,
          validMoves
        }))
      }
    } else {
      // 已选中棋子时，尝试移动或重新选择
      const selectedPiece = board[selectedPosition.row][selectedPosition.col]
      
      if (!selectedPiece) {
        // 选中位置没有棋子，清除选择
        animationManager.clearAllHighlights()
        setGameState(prev => ({
          ...prev,
          selectedPosition: null,
          validMoves: []
        }))
        return
      }
      
      if (clickedPiece && clickedPiece.color === currentPlayer) {
        // 点击己方棋子，重新选择
        // 先取消之前的选择
        animationManager.animatePieceDeselect(selectedPiece.id)
        animationManager.clearAllHighlights()
        
        const validMoves = getValidMoves(board, clickedPiece, position)
        
        // 播放选择音效和动画
        playSound('select')
        animationManager.animatePieceSelect(clickedPiece.id)
        
        // 高亮有效移动位置
        validMoves.forEach(move => {
          animationManager.animateSquareHighlight(move.row, move.col, 'valid')
        })
        
        setGameState(prev => ({
          ...prev,
          selectedPosition: position,
          validMoves
        }))
      } else {
        // 尝试移动棋子
        if (isValidMove(board, selectedPiece, selectedPosition, position)) {
          // 避免循环依赖，直接调用移动逻辑
          try {
            await handleMove(selectedPosition, position)
          } catch (error) {
            console.error('移动棋子时出错:', error)
          }
        } else {
          // 无效移动
          playSound('invalid')
          animationManager.animatePieceDeselect(selectedPiece.id)
          animationManager.clearAllHighlights()
          
          setGameState(prev => ({
            ...prev,
            selectedPosition: null,
            validMoves: []
          }))
        }
      }
    }
    
    setOperationLock(false)
  }, [gameState, isAIThinking, operationLock])

  /**
   * 处理移动逻辑
   */
  const handleMove = async (from: Position, to: Position) => {
    const piece = gameState.board[from.row][from.col]
    const capturedPiece = gameState.board[to.row][to.col]
    
    if (!piece) return
    
    // 清除高亮和选择状态
    animationManager.animatePieceDeselect(piece.id)
    animationManager.clearAllHighlights()
    
    const isCapture = !!capturedPiece
    
    // 创建移动记录
    const move: Move = {
      from,
      to,
      piece,
      capturedPiece: capturedPiece || undefined,
      timestamp: Date.now()
    }
    
    // 立即更新游戏状态
    setGameState(prev => {
      const newBoard = cloneBoard(prev.board)
      
      // 执行移动
      newBoard[to.row][to.col] = piece
      newBoard[from.row][from.col] = null
      
      // 更新被吃棋子列表
      const newCapturedPieces = { ...prev.capturedPieces }
      if (capturedPiece) {
        // 避免重复添加同一个棋子
        const alreadyExists = newCapturedPieces[capturedPiece.color].some(p => p.id === capturedPiece.id)
        if (!alreadyExists) {
          newCapturedPieces[capturedPiece.color].push(capturedPiece)
          console.log(`添加被吃棋子: ${capturedPiece.color} ${capturedPiece.type} (${capturedPiece.id})`)
        } else {
          console.warn(`棋子已存在于被吃列表中: ${capturedPiece.id}`)
        }
      }
      
      // 切换玩家
      const nextPlayer: PieceColor = prev.currentPlayer === 'red' ? 'black' : 'red'
      
      // 检查将军状态
      const nextPlayerInCheck = isInCheck(newBoard, nextPlayer)
      const isNextPlayerCheckmate = nextPlayerInCheck && isCheckmate(newBoard, nextPlayer)
      
      // 确定游戏状态
      let newGameStatus = prev.gameStatus
      let winner = prev.winner
      
      if (isNextPlayerCheckmate) {
        newGameStatus = 'checkmate'
        winner = prev.currentPlayer
      }
      
      // 如果有被吃棋子，将其加入动画列表以保持渲染
      // 被吃棋子应该在其原始位置（目标位置）播放消失动画
      const newAnimatingPieces = [...prev.animatingPieces]
      if (capturedPiece) {
        newAnimatingPieces.push({
          piece: capturedPiece,
          position: to // 被吃棋子在目标位置
        })
      }
      
      return {
        ...prev,
        board: newBoard,
        currentPlayer: nextPlayer,
        gameStatus: newGameStatus,
        selectedPosition: null,
        validMoves: [],
        moveHistory: [...prev.moveHistory, move],
        capturedPieces: newCapturedPieces,
        isInCheck: nextPlayerInCheck,
        winner,
        animatingPieces: newAnimatingPieces
      }
    })
    
    // 在状态更新后立即播放动画
    if (isCapture && capturedPiece) {
      // 播放被吃棋子的动画
      setTimeout(async () => {
        try {
          await animationManager.animatePieceCapture(capturedPiece.id)
        } catch (error) {
          console.warn('动画播放失败:', error)
        } finally {
          // 无论动画是否成功，都要清理animatingPieces
          setGameState(prevState => ({
            ...prevState,
            animatingPieces: prevState.animatingPieces.filter(ap => ap.piece.id !== capturedPiece.id)
          }))
        }
      }, 10)
      playSound('capture')
      
      // 备用清理：5秒后强制清理该棋子，防止遗留
      setTimeout(() => {
        setGameState(prevState => ({
          ...prevState,
          animatingPieces: prevState.animatingPieces.filter(ap => ap.piece.id !== capturedPiece.id)
        }))
      }, 5000)
    } else {
      playSound('move')
    }
    
    // 播放移动动画
    setTimeout(() => {
      animationManager.animatePieceMove(piece.id, from, to, isCapture)
    }, 10)
    
    // 延迟播放游戏状态音效
    setTimeout(() => {
      setGameState(currentState => {
        if (currentState.winner) {
          playVictorySound()
          animationManager.animateVictory(currentState.winner)
        } else if (currentState.isInCheck) {
          playCheckSound()
          animationManager.animateCheckWarning()
        }
        return currentState
      })
    }, 400)
  }

  /**
   * 执行棋子移动的回调版本
   */
  const makeMove = useCallback(handleMove, [handleMove])

  /**
   * 游戏结束处理 - 保存游戏历史和统计
   */
  useEffect(() => {
    if (gameState.gameStatus === 'checkmate' && gameState.winner) {
      const endTime = new Date()
      const duration = getGameDuration(gameStartTime, endTime)
      
      // 添加到游戏历史
      gameStore.addGameToHistory({
        startTime: gameStartTime,
        endTime,
        gameMode: gameState.gameMode,
        moves: gameState.moveHistory,
        winner: gameState.winner,
        finalBoard: serializeBoard(gameState.board)
      })
      
      // 更新统计 (玩家视角：红方为玩家)
      const playerResult = gameState.winner === 'red' ? 'win' : 'loss'
      gameStore.updateStats(playerResult, duration)
    }
  }, [gameState.gameStatus, gameState.winner, gameState.gameMode, gameState.moveHistory, gameState.board, gameStartTime])

  /**
   * 保存当前游戏状态 - 只在关键状态变化时保存
   */
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.moveHistory.length > 0) {
      gameStore.saveCurrentGame(gameState)
    }
  }, [gameState.moveHistory.length, gameState.gameStatus, gameState.currentPlayer])

  /**
   * AI移动处理
   */
  const handleAIMove = useCallback(async () => {
    const { gameMode, currentPlayer, board, gameStatus } = gameState
    
    // 只有在AI模式下且轮到黑方时才执行AI移动
    if (gameMode === 'pvp' || currentPlayer !== 'black' || gameStatus !== 'playing' || isAIThinking) {
      return
    }

    setIsAIThinking(true)
    
    try {
      const difficulty = gameMode === 'ai-easy' ? AI_DIFFICULTIES.easy :
                        gameMode === 'ai-medium' ? AI_DIFFICULTIES.medium :
                        AI_DIFFICULTIES.hard
      
      const aiEngine = new AIEngine(difficulty, 'black')
      const aiMove = await aiEngine.getBestMove(board)
      
      if (aiMove) {
        // 执行AI移动
        makeMove(aiMove.from, aiMove.to)
      }
    } catch (error) {
      console.error('AI移动出错:', error)
    } finally {
      setIsAIThinking(false)
    }
  }, [gameState, makeMove, isAIThinking])

  // 监听游戏状态变化，触发AI移动
  useEffect(() => {
    // 清理之前的定时器
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current)
      aiTimerRef.current = null
    }

    // 只在轮到黑方且为AI模式时触发
    if (gameState.currentPlayer === 'black' && 
        gameState.gameMode !== 'pvp' && 
        gameState.gameStatus === 'playing' && 
        !isAIThinking &&
        !operationLock) { // 增加操作锁检查
      
      aiTimerRef.current = setTimeout(() => {
        // 再次检查状态，防止延迟期间状态变化
        if (gameState.currentPlayer === 'black' && 
            gameState.gameMode !== 'pvp' && 
            gameState.gameStatus === 'playing' && 
            !isAIThinking &&
            !operationLock) {
          handleAIMove()
        }
        aiTimerRef.current = null
      }, 500) // 增加延迟确保状态更新完成
    }

    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current)
        aiTimerRef.current = null
      }
    }
  }, [gameState.currentPlayer, gameState.gameMode, gameState.gameStatus, isAIThinking, operationLock, handleAIMove])

  /**
   * 组件卸载时清理所有动画和定时器
   */
  useEffect(() => {
    return () => {
      animationManager.stopAllAnimations()
      // 清理AI定时器
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current)
        aiTimerRef.current = null
      }
    }
  }, [])

  /**
   * 重新开始游戏
   */
  const resetGame = useCallback(() => {
    setIsAIThinking(false)
    // 停止所有动画（包括胜利动画）
    animationManager.stopAllAnimations()
    // 清除当前游戏保存状态
    gameStore.clearCurrentGame()
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 'red',
      gameStatus: 'playing',
      gameMode: gameState.gameMode,
      selectedPosition: null,
      validMoves: [],
      moveHistory: [],
      capturedPieces: { red: [], black: [] },
      theme: gameStore.settings.theme,
      isInCheck: false,
      winner: null,
      animatingPieces: []
    })
  }, [gameState.gameMode])

  /**
   * 悔棋功能 - 增强版本，防止AI对抗时的竞态条件
   */
  const undoMove = useCallback(() => {
    // 防止AI思考期间或操作锁定时悔棋
    if (isAIThinking || operationLock) {
      console.warn('无法悔棋：AI正在思考或操作进行中')
      return
    }

    // 设置操作锁，防止并发操作
    setOperationLock(true)
    
    // 清理AI定时器，防止延迟触发
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current)
      aiTimerRef.current = null
    }
    
    // 强制停止AI思考状态（以防状态不同步）
    setIsAIThinking(false)
    
    setGameState(prev => {
      if (prev.moveHistory.length === 0) {
        setOperationLock(false)
        return prev
      }
      
      let newMoveHistory = [...prev.moveHistory]
      let newBoard = cloneBoard(prev.board)
      let newCapturedPieces = { ...prev.capturedPieces }
      
      // 在AI游戏模式下，悔棋应该撤销两步：AI的移动和玩家的移动
      // 这样玩家悔棋后仍然是玩家的回合
      const isAIGame = prev.gameMode !== 'pvp'
      const movesToUndo = isAIGame && prev.currentPlayer === 'black' && prev.moveHistory.length >= 2 ? 2 : 1
      
      for (let i = 0; i < movesToUndo && newMoveHistory.length > 0; i++) {
        const lastMove = newMoveHistory.pop()!
        
        // 恢复棋盘状态
        newBoard[lastMove.from.row][lastMove.from.col] = lastMove.piece
        newBoard[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece || null
        
        // 恢复被吃棋子列表
        if (lastMove.capturedPiece) {
          const capturedArray = newCapturedPieces[lastMove.capturedPiece.color]
          const index = capturedArray.findIndex(p => p.id === lastMove.capturedPiece!.id)
          if (index > -1) {
            capturedArray.splice(index, 1)
          }
        }
      }
      
      // 计算当前玩家（在AI游戏中确保悔棋后是红方/玩家的回合）
      const currentPlayer: PieceColor = isAIGame ? 'red' : (prev.currentPlayer === 'red' ? 'black' : 'red')
      
      return {
        ...prev,
        board: newBoard,
        currentPlayer,
        gameStatus: 'playing',
        selectedPosition: null,
        validMoves: [],
        moveHistory: newMoveHistory,
        capturedPieces: newCapturedPieces,
        isInCheck: isInCheck(newBoard, currentPlayer),
        winner: null,
        animatingPieces: [] // 悔棋时清除所有动画
      }
    })

    // 悔棋完成后解除操作锁
    setTimeout(() => {
      setOperationLock(false)
    }, 100)
  }, [isAIThinking, operationLock])

  /**
   * 切换游戏模式
   */
  const setGameMode = useCallback((mode: GameMode) => {
    setGameState(prev => ({
      ...prev,
      gameMode: mode
    }))
  }, [])

  /**
   * 切换主题
   */
  const setTheme = useCallback((theme: Theme) => {
    setGameState(prev => ({
      ...prev,
      theme
    }))
  }, [])

  /**
   * 获取游戏状态信息
   */
  const getGameInfo = useCallback(() => {
    const { currentPlayer, gameStatus, isInCheck, winner, moveHistory } = gameState
    
    let statusText = ''
    
    switch (gameStatus) {
      case 'playing':
        if (isInCheck) {
          statusText = `${currentPlayer === 'red' ? '红方' : '黑方'}被将军！`
        } else {
          statusText = `${currentPlayer === 'red' ? '红方' : '黑方'}行棋`
        }
        break
      case 'checkmate':
        statusText = `${winner === 'red' ? '红方' : '黑方'}胜利！`
        break
      case 'stalemate':
        statusText = '和棋'
        break
      case 'draw':
        statusText = '平局'
        break
      default:
        statusText = '等待开始'
    }
    
    return {
      statusText,
      moveCount: moveHistory.length,
      canUndo: moveHistory.length > 0 && !isAIThinking && !operationLock,
      gameOver: gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'draw'
    }
  }, [gameState, isAIThinking, operationLock])

  return {
    gameState,
    isAIThinking,
    handleSquareClick,
    resetGame,
    undoMove,
    setGameMode,
    setTheme,
    getGameInfo,
    // 持久化相关功能
    gameHistory: gameStore.gameHistory,
    gameStats: gameStore.stats,
    settings: gameStore.settings,
    updateSettings: gameStore.updateSettings,
    clearHistory: gameStore.clearHistory,
    resetStats: gameStore.resetStats
  }
}