import type { Theme } from '../types/chess'

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  id: Theme
  name: string
  description: string
  icon: string
  preview: string
  colors: {
    // 基础色彩
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    
    // 棋盘色彩
    boardLight: string
    boardMedium: string
    boardDark: string
    boardBorder: string
    
    // 棋子色彩
    redPiece: {
      background: string
      border: string
      text: string
      shadow: string
    }
    blackPiece: {
      background: string
      border: string
      text: string
      shadow: string
    }
    
    // 特效色彩
    selected: string
    validMove: string
    hover: string
    
    // 文字色彩
    textPrimary: string
    textSecondary: string
    textAccent: string
  }
  effects: {
    // 材质效果
    texture: string
    gradient: string
    shadow: string
    
    // 动画类型
    animation: 'subtle' | 'normal' | 'enhanced'
    
    // 特殊效果
    glow: boolean
    particles: boolean
    shimmer: boolean
  }
}

/**
 * 预定义主题配置
 */
export const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  // 1. 复古木质主题
  wooden: {
    id: 'wooden',
    name: '复古木质',
    description: '经典木质纹理，古朴典雅',
    icon: '🌳',
    preview: '/themes/wooden-preview.jpg',
    colors: {
      primary: '#8B4513',
      secondary: '#CD853F',
      accent: '#FFD700',
      background: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 50%, #2c1810 100%)',
      surface: 'linear-gradient(135deg, #D2B48C 0%, #CD853F 100%)',
      
      boardLight: '#F5DEB3',
      boardMedium: '#DEB887',
      boardDark: '#8B4513',
      boardBorder: '#654321',
      
      redPiece: {
        background: 'radial-gradient(circle at 30% 30%, #ff6b6b 0%, #e53e3e 30%, #c53030 60%, #9c2626 100%)',
        border: '#FFD700',
        text: '#FFD700',
        shadow: 'rgba(0, 0, 0, 0.4)'
      },
      blackPiece: {
        background: 'radial-gradient(circle at 30% 30%, #4a5568 0%, #2d3748 30%, #1a202c 60%, #0f1419 100%)',
        border: '#C0C0C0',
        text: '#C0C0C0',
        shadow: 'rgba(0, 0, 0, 0.4)'
      },
      
      selected: '#FFD700',
      validMove: 'rgba(255, 215, 0, 0.3)',
      hover: 'rgba(255, 215, 0, 0.1)',
      
      textPrimary: '#654321',
      textSecondary: '#8B4513',
      textAccent: '#FFD700'
    },
    effects: {
      texture: 'wood-grain',
      gradient: 'warm',
      shadow: 'deep',
      animation: 'normal',
      glow: true,
      particles: false,
      shimmer: true
    }
  },

  // 2. 现代科技主题
  modern: {
    id: 'modern',
    name: '未来科技',
    description: '科技感十足，炫酷夺目',
    icon: '🚀',
    preview: '/themes/modern-preview.jpg',
    colors: {
      primary: '#00D9FF',
      secondary: '#0099CC',
      accent: '#FF6B35',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      surface: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      
      boardLight: '#2a5298',
      boardMedium: '#1e3c72',
      boardDark: '#0f1c3f',
      boardBorder: '#00D9FF',
      
      redPiece: {
        background: 'radial-gradient(circle at 30% 30%, #FF6B35 0%, #F7931E 30%, #E74C3C 60%, #C0392B 100%)',
        border: '#00D9FF',
        text: '#FFFFFF',
        shadow: 'rgba(0, 217, 255, 0.5)'
      },
      blackPiece: {
        background: 'radial-gradient(circle at 30% 30%, #34495E 0%, #2C3E50 30%, #1B2631 60%, #17202A 100%)',
        border: '#00D9FF',
        text: '#00D9FF',
        shadow: 'rgba(0, 217, 255, 0.5)'
      },
      
      selected: '#00D9FF',
      validMove: 'rgba(0, 217, 255, 0.3)',
      hover: 'rgba(0, 217, 255, 0.1)',
      
      textPrimary: '#FFFFFF',
      textSecondary: '#E1E8ED',
      textAccent: '#00F5FF'
    },
    effects: {
      texture: 'metallic',
      gradient: 'neon',
      shadow: 'glow',
      animation: 'enhanced',
      glow: true,
      particles: true,
      shimmer: true
    }
  },

  // 3. 经典中式主题
  classic: {
    id: 'classic',
    name: '国风雅韵',
    description: '传统中式美学，诗意盎然',
    icon: '🏮',
    preview: '/themes/classic-preview.jpg',
    colors: {
      primary: '#B8860B',
      secondary: '#CD853F',
      accent: '#DC143C',
      background: 'linear-gradient(135deg, #f4f1eb 0%, #e8dcc0 50%, #d4c4a0 100%)',
      surface: 'linear-gradient(135deg, #FAF0E6 0%, #F5E6D3 100%)',
      
      boardLight: '#FFF8DC',
      boardMedium: '#F5DEB3',
      boardDark: '#D2B48C',
      boardBorder: '#8B4513',
      
      redPiece: {
        background: 'radial-gradient(circle at 30% 30%, #DC143C 0%, #B91C1C 30%, #991B1B 60%, #7F1D1D 100%)',
        border: '#B8860B',
        text: '#FFF8DC',
        shadow: 'rgba(139, 69, 19, 0.4)'
      },
      blackPiece: {
        background: 'radial-gradient(circle at 30% 30%, #374151 0%, #1F2937 30%, #111827 60%, #030712 100%)',
        border: '#B8860B',
        text: '#F9FAFB',
        shadow: 'rgba(139, 69, 19, 0.4)'
      },
      
      selected: '#DC143C',
      validMove: 'rgba(220, 20, 60, 0.2)',
      hover: 'rgba(220, 20, 60, 0.1)',
      
      textPrimary: '#8B4513',
      textSecondary: '#A0522D',
      textAccent: '#DC143C'
    },
    effects: {
      texture: 'silk',
      gradient: 'warm',
      shadow: 'soft',
      animation: 'subtle',
      glow: false,
      particles: false,
      shimmer: false
    }
  },

  // 4. 水晶玻璃主题
  marble: {
    id: 'marble',
    name: '水晶幻境',
    description: '晶莹剔透，梦幻唯美',
    icon: '💎',
    preview: '/themes/marble-preview.jpg',
    colors: {
      primary: '#9333EA',
      secondary: '#7C3AED',
      accent: '#F59E0B',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)',
      surface: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      
      boardLight: '#f1f5f9',
      boardMedium: '#e2e8f0',
      boardDark: '#cbd5e1',
      boardBorder: '#9333EA',
      
      redPiece: {
        background: 'radial-gradient(circle at 30% 30%, #F59E0B 0%, #D97706 30%, #B45309 60%, #92400E 100%)',
        border: '#9333EA',
        text: '#FFFFFF',
        shadow: 'rgba(147, 51, 234, 0.4)'
      },
      blackPiece: {
        background: 'radial-gradient(circle at 30% 30%, #6366F1 0%, #4F46E5 30%, #4338CA 60%, #3730A3 100%)',
        border: '#9333EA',
        text: '#FFFFFF',
        shadow: 'rgba(147, 51, 234, 0.4)'
      },
      
      selected: '#9333EA',
      validMove: 'rgba(147, 51, 234, 0.2)',
      hover: 'rgba(147, 51, 234, 0.1)',
      
      textPrimary: '#1e293b',
      textSecondary: '#475569',
      textAccent: '#9333EA'
    },
    effects: {
      texture: 'glass',
      gradient: 'crystal',
      shadow: 'sharp',
      animation: 'enhanced',
      glow: true,
      particles: true,
      shimmer: true
    }
  }
}

/**
 * 主题名称映射
 */
export const THEME_NAMES: Record<Theme, string> = {
  wooden: '复古木质',
  modern: '未来科技', 
  classic: '国风雅韵',
  marble: '水晶幻境'
}

/**
 * 获取主题配置
 */
export const getThemeConfig = (theme: Theme): ThemeConfig => {
  return THEME_CONFIGS[theme]
}

/**
 * 获取所有可用主题
 */
export const getAllThemes = (): ThemeConfig[] => {
  return Object.values(THEME_CONFIGS)
}