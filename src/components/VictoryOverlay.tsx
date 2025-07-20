import { useEffect, useState } from 'react'
import type { PieceColor } from '../types/chess'
import victoryImage from '../assets/image/eaeca54173860d76d13f9722f911d955.jpeg'

interface VictoryOverlayProps {
  winner: PieceColor | null
  gameOver: boolean
  onRestart?: () => void
}

/**
 * 胜利特效叠加组件
 * 显示胜利图片并区分红方/黑方胜利
 */
export default function VictoryOverlay({ winner, gameOver, onRestart }: VictoryOverlayProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'show' | 'exit'>('enter')

  useEffect(() => {
    if (gameOver && winner) {
      setIsVisible(true)
      setAnimationPhase('enter')
      
      // 进入动画后显示内容
      const showTimer = setTimeout(() => {
        setAnimationPhase('show')
      }, 300)

      return () => clearTimeout(showTimer)
    } else {
      setAnimationPhase('exit')
      const hideTimer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      
      return () => clearTimeout(hideTimer)
    }
  }, [gameOver, winner])

  if (!isVisible) return null

  const handleRestart = () => {
    setAnimationPhase('exit')
    setTimeout(() => {
      setIsVisible(false)
      onRestart?.()
    }, 300)
  }

  // 根据胜利方调整颜色主题
  const winnerColor = winner === 'red' ? '#dc2626' : '#1f2937'
  const winnerText = winner === 'red' ? '红方胜利' : '黑方胜利'
  const winnerGradient = winner === 'red' 
    ? 'from-red-600 to-red-800' 
    : 'from-gray-800 to-black'

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        animationPhase === 'enter' ? 'opacity-0 scale-95' :
        animationPhase === 'show' ? 'opacity-100 scale-100' :
        'opacity-0 scale-105'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full mx-4 transform transition-all duration-300"
        style={{ 
          border: `4px solid ${winnerColor}`,
          boxShadow: `0 0 30px ${winnerColor}40`
        }}
      >
        {/* 背景渐变 */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${winnerGradient} opacity-10`}
        />
        
        {/* 胜利标题 */}
        <div 
          className="relative p-6 pb-3 text-center border-b-2"
          style={{ borderColor: `${winnerColor}20` }}
        >
          <h2 
            className="text-3xl font-bold"
            style={{ color: winnerColor }}
          >
            🎉 {winnerText} 🎉
          </h2>
        </div>
        
        {/* 胜利图片 */}
        <div className="relative p-6 pt-3">
          <img 
            src={victoryImage}
            alt="胜利特效"
            className="w-full h-48 object-cover rounded-xl shadow-lg"
            style={{
              filter: winner === 'red' 
                ? 'sepia(0.3) saturate(1.2) hue-rotate(-10deg)' 
                : 'sepia(0.2) saturate(0.8) brightness(0.9)'
            }}
          />
        </div>

        {/* 操作按钮 */}
        <div className="p-6 pt-0 flex justify-center space-x-4">
          <button
            onClick={handleRestart}
            className="px-8 py-3 bg-white text-gray-800 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-2"
            style={{ borderColor: winnerColor }}
          >
            再来一局
          </button>
        </div>

        {/* 静态装饰点 */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full opacity-40"
              style={{
                backgroundColor: winnerColor,
                left: `${10 + (i * 12)}%`,
                top: `${15 + (i % 3) * 25}%`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}