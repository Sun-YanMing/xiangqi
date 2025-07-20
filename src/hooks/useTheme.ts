import { useState, useEffect, useCallback } from 'react'
import type { Theme } from '../types/chess'
import { getThemeConfig, type ThemeConfig } from '../themes'

/**
 * 主题管理Hook
 * 提供主题切换、持久化存储和主题配置访问功能
 */
export const useTheme = () => {
  // 从localStorage获取保存的主题，默认为木质主题
  const getStoredTheme = (): Theme => {
    try {
      const stored = localStorage.getItem('xiangqi-theme')
      if (stored && ['wooden', 'modern', 'classic', 'marble'].includes(stored)) {
        return stored as Theme
      }
    } catch (error) {
      console.warn('获取存储主题失败:', error)
    }
    return 'wooden' // 默认主题
  }

  const [currentTheme, setCurrentTheme] = useState<Theme>(getStoredTheme)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(getThemeConfig(currentTheme))

  /**
   * 应用主题到DOM
   */
  const applyThemeToDOM = useCallback((theme: Theme) => {
    const root = document.documentElement
    
    // 设置主题数据属性
    root.setAttribute('data-theme', theme)
    
    // 获取主题配置
    const config = getThemeConfig(theme)
    
    // 设置完整的CSS变量来确保同步
    root.style.setProperty('--primary', config.colors.primary)
    root.style.setProperty('--secondary', config.colors.secondary)
    root.style.setProperty('--accent', config.colors.accent)
    root.style.setProperty('--background', config.colors.background)
    root.style.setProperty('--surface', config.colors.surface)
    
    root.style.setProperty('--board-light', config.colors.boardLight)
    root.style.setProperty('--board-medium', config.colors.boardMedium)
    root.style.setProperty('--board-dark', config.colors.boardDark)
    root.style.setProperty('--board-border', config.colors.boardBorder)
    
    root.style.setProperty('--red-piece-bg', config.colors.redPiece.background)
    root.style.setProperty('--red-piece-border', config.colors.redPiece.border)
    root.style.setProperty('--red-piece-text', config.colors.redPiece.text)
    
    root.style.setProperty('--black-piece-bg', config.colors.blackPiece.background)
    root.style.setProperty('--black-piece-border', config.colors.blackPiece.border)
    root.style.setProperty('--black-piece-text', config.colors.blackPiece.text)
    
    root.style.setProperty('--selected', config.colors.selected)
    root.style.setProperty('--valid-move', config.colors.validMove)
    root.style.setProperty('--hover', config.colors.hover)
    
    root.style.setProperty('--text-primary', config.colors.textPrimary)
    root.style.setProperty('--text-secondary', config.colors.textSecondary)
    root.style.setProperty('--text-accent', config.colors.textAccent)
    
    // 更新页面标题颜色（移动端）
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', config.colors.primary)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = config.colors.primary
      document.head.appendChild(meta)
    }

    setThemeConfig(config)
  }, [])

  /**
   * 切换主题
   */
  const changeTheme = useCallback(async (newTheme: Theme) => {
    if (newTheme === currentTheme) return

    setIsTransitioning(true)
    
    try {
      // 保存到localStorage
      localStorage.setItem('xiangqi-theme', newTheme)
      
      // 添加过渡动画
      document.body.classList.add('theme-transitioning')
      
      // 短暂延迟以显示过渡效果
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // 应用新主题
      applyThemeToDOM(newTheme)
      setCurrentTheme(newTheme)
      
      // 移除过渡类
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning')
        setIsTransitioning(false)
      }, 450)
      
      console.log(`🎨 主题已切换至: ${getThemeConfig(newTheme).name}`)
      
    } catch (error) {
      console.error('主题切换失败:', error)
      setIsTransitioning(false)
    }
  }, [currentTheme, applyThemeToDOM])

  /**
   * 获取所有可用主题
   */
  const getAllThemes = useCallback((): ThemeConfig[] => {
    return [
      getThemeConfig('wooden'),
      getThemeConfig('modern'), 
      getThemeConfig('classic'),
      getThemeConfig('marble')
    ]
  }, [])

  /**
   * 检查是否为暗色主题
   */
  const isDarkTheme = useCallback((): boolean => {
    return ['modern', 'marble'].includes(currentTheme)
  }, [currentTheme])

  /**
   * 获取主题对比色
   */
  const getContrastColor = useCallback((backgroundColor: string): string => {
    // 简单的对比度计算
    const rgb = backgroundColor.match(/\d+/g)
    if (!rgb) return '#000000'
    
    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000
    return brightness > 128 ? '#000000' : '#FFFFFF'
  }, [])

  /**
   * 预加载主题资源
   */
  const preloadThemeAssets = useCallback(async (theme: Theme) => {
    const config = getThemeConfig(theme)
    
    // 预加载主题预览图
    if (config.preview) {
      const img = new Image()
      img.src = config.preview
    }
    
    // 预加载字体（如果需要）
    if (theme === 'classic') {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = 'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap'
      link.as = 'style'
      document.head.appendChild(link)
    }
  }, [])

  // 初始化主题
  useEffect(() => {
    applyThemeToDOM(currentTheme)
    
    // 预加载其他主题资源
    const otherThemes = ['wooden', 'modern', 'classic', 'marble'].filter(t => t !== currentTheme) as Theme[]
    otherThemes.forEach(theme => {
      setTimeout(() => preloadThemeAssets(theme), 1000)
    })
  }, [currentTheme, applyThemeToDOM, preloadThemeAssets])

  // 监听系统主题变化（可选）
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // 如果用户没有手动设置主题，可以跟随系统主题
      const storedTheme = localStorage.getItem('xiangqi-theme')
      if (!storedTheme) {
        const systemTheme: Theme = e.matches ? 'modern' : 'classic'
        changeTheme(systemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [changeTheme])

  return {
    // 当前状态
    currentTheme,
    themeConfig,
    isTransitioning,
    
    // 操作方法
    changeTheme,
    getAllThemes,
    
    // 工具方法
    isDarkTheme,
    getContrastColor,
    preloadThemeAssets,
    
    // 主题信息
    themeName: themeConfig.name,
    themeIcon: themeConfig.icon,
    themeDescription: themeConfig.description
  }
}