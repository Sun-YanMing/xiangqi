import React, { useState } from 'react'
import type { GameMode, Theme } from '../types/chess'
import { soundManager } from '../utils/soundEffects'

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

  /**
   * 处理音效开关
   */
  const handleSoundToggle = () => {
    const newSoundEnabled = !soundEnabled
    setSoundEnabled(newSoundEnabled)
    soundManager.setEnabled(newSoundEnabled)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* 模态框头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="i-tabler-settings mr-2"></span>
            游戏设置
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="i-tabler-x text-xl"></span>
          </button>
        </div>

        {/* 模态框内容 */}
        <div className="p-4 space-y-4">
          {/* 游戏模式设置 */}
          <div>
            <label className="block text-sm font-medium mb-2">游戏模式</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'pvp', label: '双人', icon: 'i-tabler-users' },
                { value: 'ai-easy', label: 'AI简单', icon: 'i-tabler-robot' },
                { value: 'ai-medium', label: 'AI中等', icon: 'i-tabler-robot' },
                { value: 'ai-hard', label: 'AI困难', icon: 'i-tabler-robot' }
              ].map(mode => (
                <button
                  key={mode.value}
                  onClick={() => onGameModeChange(mode.value as GameMode)}
                  className={`p-2 rounded-md border text-sm flex items-center justify-center transition-colors ${
                    gameMode === mode.value
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className={`${mode.icon} mr-1`}></span>
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* 主题设置 */}
          <div>
            <label className="block text-sm font-medium mb-2">棋盘主题</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'classic', label: '经典', color: 'bg-yellow-100' },
                { value: 'modern', label: '现代', color: 'bg-blue-50' },
                { value: 'wooden', label: '木质', color: 'bg-amber-100' },
                { value: 'marble', label: '大理石', color: 'bg-gray-100' }
              ].map(themeOption => (
                <button
                  key={themeOption.value}
                  onClick={() => onThemeChange(themeOption.value as Theme)}
                  className={`p-2 rounded-md border text-sm flex items-center justify-center transition-colors ${
                    theme === themeOption.value
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${themeOption.color} mr-2 border`}></div>
                  {themeOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* 音效设置 */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium mb-2">音效设置</label>
            <button
              onClick={handleSoundToggle}
              className={`w-full flex items-center justify-between p-3 rounded-md border transition-colors ${
                soundEnabled
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-gray-50 border-gray-300 text-gray-500'
              }`}
            >
              <div className="flex items-center">
                <span className={`${soundEnabled ? 'i-tabler-volume' : 'i-tabler-volume-off'} mr-2`}></span>
                游戏音效
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors relative ${
                soundEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform absolute top-0.5 ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </div>
            </button>
          </div>

          {/* 棋谱导入导出 */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium mb-2">棋谱管理</label>
            <div className="space-y-2">
              {onExportPGN && (
                <button
                  onClick={onExportPGN}
                  className="w-full flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 border border-green-300 rounded-md hover:bg-green-100 transition-colors text-sm"
                >
                  <span className="i-tabler-download mr-2"></span>
                  导出棋谱 (PGN)
                </button>
              )}
              
              {onImportPGN && (
                <label className="w-full flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors text-sm cursor-pointer">
                  <span className="i-tabler-upload mr-2"></span>
                  导入棋谱 (PGN)
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
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-2">快捷键</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>重新开始:</span>
                <code className="bg-gray-100 px-1 rounded">Ctrl + N</code>
              </div>
              <div className="flex justify-between">
                <span>悔棋:</span>
                <code className="bg-gray-100 px-1 rounded">Ctrl + Z</code>
              </div>
              <div className="flex justify-between">
                <span>设置:</span>
                <code className="bg-gray-100 px-1 rounded">Ctrl + ,</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameSettings