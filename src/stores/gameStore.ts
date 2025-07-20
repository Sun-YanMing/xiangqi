import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { GameState, Move, GameMode, Theme } from '../types/chess'
import { createInitialBoard } from '../utils/boardUtils'

/**
 * 游戏历史记录接口
 */
interface GameHistory {
  id: string
  startTime: Date
  endTime?: Date
  gameMode: GameMode
  moves: Move[]
  winner?: 'red' | 'black' | 'draw'
  finalBoard: string // JSON serialized board state
}

/**
 * 游戏统计接口
 */
interface GameStats {
  totalGames: number
  wins: number
  losses: number
  draws: number
  winRate: number
  averageGameDuration: number // in minutes
}

/**
 * 持久化游戏存储接口
 */
interface GameStore {
  // 当前游戏状态
  currentGame: GameState | null
  
  // 游戏历史
  gameHistory: GameHistory[]
  
  // 游戏统计
  stats: GameStats
  
  // 用户设置
  settings: {
    soundEnabled: boolean
    animationEnabled: boolean
    theme: Theme
    aiDifficulty: 'easy' | 'medium' | 'hard' | 'expert'
  }
  
  // Actions
  saveCurrentGame: (gameState: GameState) => void
  clearCurrentGame: () => void
  addGameToHistory: (game: Omit<GameHistory, 'id'>) => void
  updateStats: (result: 'win' | 'loss' | 'draw', duration: number) => void
  updateSettings: (settings: Partial<GameStore['settings']>) => void
  clearHistory: () => void
  resetStats: () => void
}

/**
 * 默认设置
 */
const defaultSettings = {
  soundEnabled: true,
  animationEnabled: true,
  theme: 'classic' as const,
  aiDifficulty: 'medium' as const
}

/**
 * 默认统计
 */
const defaultStats: GameStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winRate: 0,
  averageGameDuration: 0
}

/**
 * 游戏持久化存储
 * 使用 zustand 进行状态管理，localStorage 进行数据持久化
 */
export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      currentGame: null,
      gameHistory: [],
      stats: defaultStats,
      settings: defaultSettings,
      
      saveCurrentGame: (gameState: GameState) => {
        set({ currentGame: gameState })
      },
      
      clearCurrentGame: () => {
        set({ currentGame: null })
      },
      
      addGameToHistory: (game: Omit<GameHistory, 'id'>) => {
        const newGame: GameHistory = {
          ...game,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }
        
        set((state) => ({
          gameHistory: [newGame, ...state.gameHistory].slice(0, 100) // 保留最近100局游戏
        }))
      },
      
      updateStats: (result: 'win' | 'loss' | 'draw', duration: number) => {
        set((state) => {
          const newStats = { ...state.stats }
          newStats.totalGames += 1
          
          if (result === 'win') newStats.wins += 1
          else if (result === 'loss') newStats.losses += 1
          else newStats.draws += 1
          
          newStats.winRate = newStats.totalGames > 0 
            ? Math.round((newStats.wins / newStats.totalGames) * 100) 
            : 0
          
          newStats.averageGameDuration = newStats.totalGames > 0
            ? Math.round(
                ((newStats.averageGameDuration * (newStats.totalGames - 1)) + duration) / newStats.totalGames
              )
            : duration
          
          return { stats: newStats }
        })
      },
      
      updateSettings: (newSettings: Partial<GameStore['settings']>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },
      
      clearHistory: () => {
        set({ gameHistory: [] })
      },
      
      resetStats: () => {
        set({ stats: defaultStats })
      }
    }),
    {
      name: 'xiangqi-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gameHistory: state.gameHistory,
        stats: state.stats,
        settings: state.settings,
        // currentGame 不持久化，每次重新开始游戏
      }),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        // 处理版本迁移
        if (version === 0 && persistedState && typeof persistedState === 'object') {
          const state = persistedState as Record<string, unknown>
          // 从 v0 迁移到 v1 的逻辑
          return {
            ...state,
            settings: { ...defaultSettings, ...(state.settings || {}) },
            stats: { ...defaultStats, ...(state.stats || {}) }
          }
        }
        return persistedState
      }
    }
  )
)

/**
 * 获取当前游戏持续时间（分钟）
 */
export const getGameDuration = (startTime: Date, endTime?: Date): number => {
  const end = endTime || new Date()
  return Math.round((end.getTime() - startTime.getTime()) / (1000 * 60))
}

/**
 * 序列化棋盘状态
 */
export const serializeBoard = (board: GameState['board']): string => {
  return JSON.stringify(board)
}

/**
 * 反序列化棋盘状态
 */
export const deserializeBoard = (boardStr: string): GameState['board'] => {
  try {
    return JSON.parse(boardStr)
  } catch {
    return createInitialBoard()
  }
}