import React, { useState } from 'react'
import type { Theme } from '../types/chess'
import { useTheme } from '../hooks/useTheme'

interface ThemeSelectorProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * 主题选择器组件
 * 提供美观的主题预览和切换界面
 */
const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose }) => {
  const { 
    currentTheme, 
    changeTheme, 
    getAllThemes, 
    isTransitioning,
    themeConfig 
  } = useTheme()
  
  const [hoveredTheme, setHoveredTheme] = useState<Theme | null>(null)
  const allThemes = getAllThemes()

  /**
   * 处理主题选择
   */
  const handleThemeSelect = async (theme: Theme) => {
    if (theme !== currentTheme && !isTransitioning) {
      await changeTheme(theme)
      
      // 短暂延迟后关闭选择器
      setTimeout(() => {
        onClose()
      }, 600)
    }
  }

  /**
   * 渲染主题预览卡片
   */
  const renderThemeCard = (theme: typeof allThemes[0]) => {
    const isActive = theme.id === currentTheme
    const isHovered = hoveredTheme === theme.id
    
    return (
      <div
        key={theme.id}
        className={`theme-preview-card relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
          isActive ? 'ring-4 ring-opacity-60' : ''
        } ${isTransitioning ? 'pointer-events-none' : ''}`}
        style={{
          background: theme.colors.surface,
          borderColor: theme.colors.primary,
          borderWidth: isActive ? '3px' : '2px',
          borderStyle: 'solid',
          boxShadow: isActive 
            ? `0 0 30px ${theme.colors.accent}40` 
            : isHovered 
              ? `0 8px 25px ${theme.colors.primary}30`
              : '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}
        onClick={() => handleThemeSelect(theme.id)}
        onMouseEnter={() => setHoveredTheme(theme.id)}
        onMouseLeave={() => setHoveredTheme(null)}
      >
        {/* 主题预览内容 */}
        <div className="p-6">
          {/* 主题图标和名称 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span 
                className="text-3xl filter drop-shadow-lg"
                style={{ 
                  filter: `drop-shadow(0 2px 4px ${theme.colors.primary}40)` 
                }}
              >
                {theme.icon}
              </span>
              <div>
                <h3 
                  className="font-bold text-lg"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {theme.name}
                </h3>
                <p 
                  className="text-sm opacity-80"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {theme.description}
                </p>
              </div>
            </div>
            
            {/* 选中状态指示器 */}
            {isActive && (
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center animate-pulse"
                style={{ backgroundColor: theme.colors.accent }}
              >
                <span className="text-white text-sm">✓</span>
              </div>
            )}
          </div>

          {/* 迷你棋盘预览 */}
          <div 
            className="grid grid-cols-3 gap-1 mb-4 p-3 rounded-lg"
            style={{ 
              backgroundColor: theme.colors.boardLight,
              border: `2px solid ${theme.colors.boardBorder}`
            }}
          >
            {/* 模拟棋盘格子 */}
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className="aspect-square rounded-sm border transition-all duration-200"
                style={{
                  backgroundColor: i % 2 === 0 ? theme.colors.boardMedium : theme.colors.boardLight,
                  borderColor: theme.colors.boardDark,
                  borderWidth: '1px'
                }}
              >
                {/* 放置几个示例棋子 */}
                {i === 1 && (
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold border-2"
                    style={{
                      background: theme.colors.redPiece.background,
                      borderColor: theme.colors.redPiece.border,
                      color: theme.colors.redPiece.text,
                      fontSize: '10px'
                    }}
                  >
                    帅
                  </div>
                )}
                {i === 7 && (
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold border-2"
                    style={{
                      background: theme.colors.blackPiece.background,
                      borderColor: theme.colors.blackPiece.border,
                      color: theme.colors.blackPiece.text,
                      fontSize: '10px'
                    }}
                  >
                    将
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 主题特效标签 */}
          <div className="flex flex-wrap gap-2">
            {theme.effects.glow && (
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${theme.colors.accent}20`,
                  color: theme.colors.accent 
                }}
              >
                ✨ 光效
              </span>
            )}
            {theme.effects.particles && (
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${theme.colors.primary}20`,
                  color: theme.colors.primary 
                }}
              >
                🌟 粒子
              </span>
            )}
            {theme.effects.shimmer && (
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${theme.colors.secondary}20`,
                  color: theme.colors.secondary 
                }}
              >
                💫 闪烁
              </span>
            )}
          </div>
        </div>

        {/* 悬停效果遮罩 */}
        {isHovered && !isActive && (
          <div 
            className="absolute inset-0 bg-gradient-to-br opacity-10 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
            }}
          />
        )}

        {/* 切换加载效果 */}
        {isTransitioning && isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
            <div 
              className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: theme.colors.accent }}
            />
          </div>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div 
        className="max-w-4xl w-full max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{
          background: themeConfig.colors.surface,
          border: `3px solid ${themeConfig.colors.primary}`
        }}
      >
        {/* 头部 */}
        <div 
          className="flex items-center justify-between p-6 border-b-2"
          style={{ borderColor: themeConfig.colors.primary }}
        >
          <h2 
            className="text-2xl font-bold flex items-center"
            style={{ color: themeConfig.colors.textPrimary }}
          >
            🎨 <span className="ml-3">主题皮肤</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all hover:scale-110"
            style={{
              backgroundColor: themeConfig.colors.accent,
              color: 'white'
            }}
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* 当前主题信息 */}
        <div 
          className="p-6 border-b-2"
          style={{ 
            borderColor: themeConfig.colors.primary,
            backgroundColor: `${themeConfig.colors.primary}10`
          }}
        >
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{themeConfig.icon}</span>
            <div>
              <h3 
                className="text-xl font-bold"
                style={{ color: themeConfig.colors.textPrimary }}
              >
                当前主题: {themeConfig.name}
              </h3>
              <p 
                className="opacity-80"
                style={{ color: themeConfig.colors.textSecondary }}
              >
                {themeConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* 主题选择网格 */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allThemes.map(renderThemeCard)}
          </div>
        </div>

        {/* 底部提示 */}
        <div 
          className="p-6 border-t-2 text-center"
          style={{ borderColor: themeConfig.colors.primary }}
        >
          <p 
            className="text-sm opacity-70"
            style={{ color: themeConfig.colors.textSecondary }}
          >
            💡 选择你喜欢的主题，设置会自动保存
          </p>
        </div>
      </div>
    </div>
  )
}

export default ThemeSelector