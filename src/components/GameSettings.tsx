import React, { useState } from 'react'
import type { GameMode, Theme } from '../types/chess'
import { soundManager } from '../utils/soundEffects'
import ThemeSelector from './ThemeSelector'
import { useTheme } from '../hooks/useTheme'

interface GameSettingsProps {
  gameMode: GameMode
  theme: Theme
  isOpen: boolean
  onGameModeChange: (mode: GameMode) => void
  onThemeChange: (theme: Theme) => void
  onClose: () => void
  onExportPGN?: () => void
  onImportPGN?: (file: File) => void
}

/**
 * 游戏设置组件
 * 提供高级设置选项和导入导出功能
 */
const GameSettings: React.FC<GameSettingsProps> = ({
  gameMode,
  theme,
  isOpen,
  onGameModeChange,
  onThemeChange,
  onClose,
  onExportPGN,
  onImportPGN
}) => {
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isAudioEnabled())
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState(soundManager.isBackgroundMusicEnabled())
  const [musicVolume, setMusicVolume] = useState(0.3)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const { themeConfig } = useTheme()

  /**
   * 处理音效开关
   */
  const handleSoundToggle = () => {
    const newSoundEnabled = !soundEnabled
    setSoundEnabled(newSoundEnabled)
    soundManager.setEnabled(newSoundEnabled)
  }

  /**
   * 处理背景音乐开关
   */
  const handleBackgroundMusicToggle = () => {
    const newBackgroundMusicEnabled = !backgroundMusicEnabled
    setBackgroundMusicEnabled(newBackgroundMusicEnabled)
    soundManager.setBackgroundMusicEnabled(newBackgroundMusicEnabled)
  }

  /**
   * 处理音量调节
   */
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value)
    setMusicVolume(newVolume)
    soundManager.setBackgroundMusicVolume(newVolume)
  }

  /**
   * 处理文件导入
   */
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImportPGN) {
      onImportPGN(file)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="themed-info-panel rounded-lg shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{
          background: themeConfig.colors.surface,
          border: `3px solid ${themeConfig.colors.primary}`
        }}
      >
        {/* 模态框头部 */}
        <div 
          className="flex items-center justify-between p-6 border-b-2"
          style={{ borderColor: themeConfig.colors.primary }}
        >
          <h3 
            className="themed-title text-2xl flex items-center font-bold"
            style={{ color: themeConfig.colors.textAccent }}
          >
            <span className="mr-3 text-3xl">⚙️</span>
            游戏设置
          </h3>
          <button
            onClick={onClose}
            className="themed-btn p-2 text-xl hover:scale-110 transition-transform"
            style={{
              backgroundColor: themeConfig.colors.accent,
              color: themeConfig.colors.textPrimary
            }}
          >
            ✕
          </button>
        </div>

        {/* 模态框内容 */}
        <div className="p-6 space-y-6">
          {/* 游戏模式设置 */}
          <div>
            <label 
              className="block text-lg font-bold mb-4"
              style={{ color: themeConfig.colors.textPrimary }}
            >
              🎮 游戏模式
            </label>
            <div className="space-y-2">
              {/* 双人对战 */}
              <button
                onClick={() => onGameModeChange('pvp')}
                className="w-full p-4 rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: gameMode === 'pvp' ? themeConfig.colors.accent : themeConfig.colors.secondary,
                  color: themeConfig.colors.textPrimary,
                  border: `2px solid ${gameMode === 'pvp' ? themeConfig.colors.selected : themeConfig.colors.primary}`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="i-tabler-users">👥</span>
                    <span className="font-medium">双人对战</span>
                  </div>
                  <span 
                    className="text-xs"
                    style={{ color: themeConfig.colors.textSecondary }}
                  >
                    本地双人
                  </span>
                </div>
              </button>
              
              {/* AI 难度选择 */}
              <div className="space-y-3">
                <span 
                  className="text-md font-bold"
                  style={{ color: themeConfig.colors.textPrimary }}
                >
                  🤖 AI 对战难度
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'ai-easy', label: 'AI入门', icon: '🟢', description: '适合新手，2层搜索' },
                    { value: 'ai-medium', label: 'AI业余', icon: '🟡', description: '中等难度，3层搜索' },
                    { value: 'ai-hard', label: 'AI专业', icon: '🟠', description: '较强棋力，4层搜索' },
                    { value: 'ai-expert', label: 'AI大师', icon: '🔴', description: '顶级棋力，5层搜索' }
                  ].map(mode => (
                    <button
                      key={mode.value}
                      onClick={() => onGameModeChange(mode.value as GameMode)}
                      className="p-4 rounded-lg transition-all text-left hover:scale-105"
                      style={{
                        backgroundColor: gameMode === mode.value ? themeConfig.colors.accent : themeConfig.colors.secondary,
                        color: themeConfig.colors.textPrimary,
                        border: `2px solid ${gameMode === mode.value ? themeConfig.colors.selected : themeConfig.colors.primary}`,
                        transform: gameMode === mode.value ? 'scale(1.05)' : 'scale(1)'
                      }}
                      title={mode.description}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xl">{mode.icon}</span>
                        <span className="font-bold text-sm">{mode.label}</span>
                      </div>
                      <div 
                        className="text-xs opacity-90"
                        style={{ color: themeConfig.colors.textSecondary }}
                      >
                        {mode.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 主题设置 */}
          <div>
            <label 
              className="block text-lg font-bold mb-4"
              style={{ color: themeConfig.colors.textPrimary }}
            >
              🎨 主题皮肤
            </label>
            
            {/* 当前主题显示 */}
            <div 
              className="mb-4 p-4 rounded-lg border-2"
              style={{
                borderColor: themeConfig.colors.primary,
                backgroundColor: `${themeConfig.colors.primary}20`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{themeConfig.icon}</span>
                  <div>
                    <div 
                      className="font-bold"
                      style={{ color: themeConfig.colors.textPrimary }}
                    >
                      {themeConfig.name}
                    </div>
                    <div 
                      className="text-sm opacity-80"
                      style={{ color: themeConfig.colors.textSecondary }}
                    >
                      {themeConfig.description}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowThemeSelector(true)}
                  className="px-4 py-2 text-sm hover:scale-105 transition-transform rounded-lg"
                  style={{
                    backgroundColor: themeConfig.colors.accent,
                    color: themeConfig.colors.textPrimary,
                    border: `2px solid ${themeConfig.colors.selected}`
                  }}
                >
                  更换主题
                </button>
              </div>
            </div>
            
            {/* 快速主题切换按钮 */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'wooden', label: '复古木质', icon: '🌳', color: 'bg-amber-600' },
                { value: 'modern', label: '未来科技', icon: '🚀', color: 'bg-blue-400' },
                { value: 'classic', label: '国风雅韵', icon: '🏮', color: 'bg-yellow-400' },
                { value: 'marble', label: '水晶幻境', icon: '💎', color: 'bg-purple-400' }
              ].map(themeOption => (
                <button
                  key={themeOption.value}
                  onClick={() => onThemeChange(themeOption.value as Theme)}
                  className="p-3 rounded-lg text-sm flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    backgroundColor: theme === themeOption.value ? themeConfig.colors.accent : themeConfig.colors.secondary,
                    color: themeConfig.colors.textPrimary,
                    border: `2px solid ${theme === themeOption.value ? themeConfig.colors.selected : themeConfig.colors.primary}`,
                    transform: theme === themeOption.value ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <span className="text-lg mr-2">{themeOption.icon}</span>
                  <div className={`w-3 h-3 rounded-full ${themeOption.color} mr-2 border border-white shadow-sm`}></div>
                  <span className="font-medium text-xs">{themeOption.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 音效设置 */}
          <div 
            className="pt-6 border-t-2"
            style={{ borderColor: themeConfig.colors.primary }}
          >
            <label 
              className="block text-lg font-bold mb-4"
              style={{ color: themeConfig.colors.textPrimary }}
            >
              🔊 音效设置
            </label>
            
            <div className="space-y-4">
              {/* 游戏音效开关 */}
              <button
                onClick={handleSoundToggle}
                className="w-full flex items-center justify-between p-4 rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: soundEnabled ? themeConfig.colors.accent : themeConfig.colors.secondary,
                  color: themeConfig.colors.textPrimary,
                  border: `2px solid ${themeConfig.colors.primary}`,
                  opacity: soundEnabled ? 1 : 0.6
                }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{soundEnabled ? '🔊' : '🔇'}</span>
                  <span className="font-bold">游戏音效</span>
                </div>
                <div 
                  className="w-14 h-7 rounded-full transition-all relative shadow-inner"
                  style={{
                    backgroundColor: soundEnabled ? themeConfig.colors.selected : themeConfig.colors.boardMedium
                  }}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform absolute top-0.5 ${
                    soundEnabled ? 'translate-x-7' : 'translate-x-0.5'
                  }`}></div>
                </div>
              </button>

              {/* 背景音乐开关 */}
              <button
                onClick={handleBackgroundMusicToggle}
                className="w-full flex items-center justify-between p-4 rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: backgroundMusicEnabled ? themeConfig.colors.accent : themeConfig.colors.secondary,
                  color: themeConfig.colors.textPrimary,
                  border: `2px solid ${themeConfig.colors.primary}`,
                  opacity: backgroundMusicEnabled ? 1 : 0.6
                }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{backgroundMusicEnabled ? '🎵' : '🎵'}</span>
                  <span className="font-bold">背景音乐</span>
                </div>
                <div 
                  className="w-14 h-7 rounded-full transition-all relative shadow-inner"
                  style={{
                    backgroundColor: backgroundMusicEnabled ? themeConfig.colors.selected : themeConfig.colors.boardMedium
                  }}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform absolute top-0.5 ${
                    backgroundMusicEnabled ? 'translate-x-7' : 'translate-x-0.5'
                  }`}></div>
                </div>
              </button>

              {/* 音量控制滑块 */}
              {backgroundMusicEnabled && (
                <div 
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: `${themeConfig.colors.primary}15`,
                    border: `1px solid ${themeConfig.colors.primary}`
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span 
                      className="font-medium text-sm"
                      style={{ color: themeConfig.colors.textPrimary }}
                    >
                      🎚️ 音乐音量
                    </span>
                    <span 
                      className="text-sm font-bold"
                      style={{ color: themeConfig.colors.textAccent }}
                    >
                      {Math.round(musicVolume * 100)}%
                    </span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={musicVolume}
                      onChange={handleVolumeChange}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${themeConfig.colors.selected} 0%, ${themeConfig.colors.selected} ${musicVolume * 100}%, ${themeConfig.colors.boardMedium} ${musicVolume * 100}%, ${themeConfig.colors.boardMedium} 100%)`,
                        outline: 'none'
                      }}
                    />
                    <style>{`
                      input[type="range"]::-webkit-slider-thumb {
                        appearance: none;
                        height: 20px;
                        width: 20px;
                        border-radius: 50%;
                        background: ${themeConfig.colors.textAccent};
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        cursor: pointer;
                      }
                      input[type="range"]::-moz-range-thumb {
                        height: 20px;
                        width: 20px;
                        border-radius: 50%;
                        background: ${themeConfig.colors.textAccent};
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        cursor: pointer;
                        border: none;
                      }
                    `}</style>
                  </div>
                  
                  <div className="flex justify-between text-xs mt-2">
                    <span style={{ color: themeConfig.colors.textSecondary }}>静音</span>
                    <span style={{ color: themeConfig.colors.textSecondary }}>最大</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 棋谱导入导出 */}
          <div 
            className="pt-6 border-t-2"
            style={{ borderColor: themeConfig.colors.primary }}
          >
            <label 
              className="block text-lg font-bold mb-4"
              style={{ color: themeConfig.colors.textPrimary }}
            >
              📋 棋谱管理
            </label>
            <div className="space-y-3">
              {onExportPGN && (
                <button
                  onClick={onExportPGN}
                  className="w-full p-4 flex items-center justify-center hover:scale-105 rounded-lg transition-all"
                  style={{
                    backgroundColor: themeConfig.colors.secondary,
                    color: themeConfig.colors.textPrimary,
                    border: `2px solid ${themeConfig.colors.primary}`
                  }}
                >
                  <span className="text-xl mr-3">📥</span>
                  <span className="font-bold">导出棋谱 (PGN)</span>
                </button>
              )}
              
              {onImportPGN && (
                <label 
                  className="w-full p-4 flex items-center justify-center cursor-pointer hover:scale-105 rounded-lg transition-all"
                  style={{
                    backgroundColor: themeConfig.colors.secondary,
                    color: themeConfig.colors.textPrimary,
                    border: `2px solid ${themeConfig.colors.primary}`
                  }}
                >
                  <span className="text-xl mr-3">📤</span>
                  <span className="font-bold">导入棋谱 (PGN)</span>
                  <input
                    type="file"
                    accept=".pgn,.txt"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* 键盘快捷键说明 */}
          <div 
            className="pt-6 border-t-2"
            style={{ borderColor: themeConfig.colors.primary }}
          >
            <h4 
              className="text-lg font-bold mb-4"
              style={{ color: themeConfig.colors.textPrimary }}
            >
              ⌨️ 快捷键
            </h4>
            <div 
              className="p-4 space-y-3 rounded-lg"
              style={{
                backgroundColor: `${themeConfig.colors.primary}10`,
                border: `1px solid ${themeConfig.colors.primary}`
              }}
            >
              <div className="flex justify-between items-center">
                <span 
                  className="font-medium"
                  style={{ color: themeConfig.colors.textPrimary }}
                >
                  重新开始:
                </span>
                <code 
                  className="px-3 py-1 text-sm rounded"
                  style={{
                    backgroundColor: themeConfig.colors.accent,
                    color: themeConfig.colors.textPrimary
                  }}
                >
                  Ctrl + N
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span 
                  className="font-medium"
                  style={{ color: themeConfig.colors.textPrimary }}
                >
                  悔棋:
                </span>
                <code 
                  className="px-3 py-1 text-sm rounded"
                  style={{
                    backgroundColor: themeConfig.colors.accent,
                    color: themeConfig.colors.textPrimary
                  }}
                >
                  Ctrl + Z
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span 
                  className="font-medium"
                  style={{ color: themeConfig.colors.textPrimary }}
                >
                  设置:
                </span>
                <code 
                  className="px-3 py-1 text-sm rounded"
                  style={{
                    backgroundColor: themeConfig.colors.accent,
                    color: themeConfig.colors.textPrimary
                  }}
                >
                  Ctrl + ,
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 主题选择器模态框 */}
      <ThemeSelector
        isOpen={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />
    </div>
  )
}

export default GameSettings