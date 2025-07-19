# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chinese chess (象棋/Xiangqi) game built with React + TypeScript + Vite. The project features:
- Modern React 19 with TypeScript 5.8
- UnoCSS for utility-first styling with custom chess-specific shortcuts
- Tabler icons integration via @iconify-json/tabler
- ESLint configuration for code quality
- Multiple game modes: PvP and AI opponents (easy/medium/hard)
- Theme system with multiple board styles

## Development Commands

```bash
# Start development server (runs on port 3000 with host access)
npm run dev

# Build for production (includes TypeScript compilation)
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Development Tools

### Custom DevTools Component
- **Location**: Right bottom corner with 🔗 icon 
- **Features**: Real-time game state monitoring, board visualization, move history
- **Styling**: Beautiful gradient design with UnoCSS animations
- **Tabs**: 状态/棋盘/移动 for organized debugging
- **Hotkey**: Available only in development environment

### React Dev Inspector
- **Package**: `react-dev-inspector` + vite plugin
- **功能**: 点击浏览器元素直接跳转到IDE源码
- **使用方法**: 
  1. 按住 `Ctrl+Shift+Command` (Mac) 或 `Ctrl+Shift+C` (Windows/Linux)
  2. 点击页面上的任意React组件
  3. 自动在IDE中打开对应的源代码文件
- **注意**: 这不是可视化调试面板，而是隐藏的点击跳转功能
- **配置**: 已在 vite.config.ts 和 App.tsx 中配置完成

### Available Inspectors
- UnoCSS Inspector: `http://localhost:3001/__unocss/`
- Custom DevTools: Bottom-right corner button
- React Dev Inspector: Ctrl+Shift+C hotkey

## Code Architecture

### Type System (`src/types/chess.ts`)
The complete type system for Chinese chess is already defined:
- `ChessPiece`: Core piece interface with type, color, and id
- `Position`: Board coordinates (row, col)
- `GameState`: Complete game state including board, players, moves, etc.
- `Move`: Move history with piece capture tracking
- `PieceType`: Seven piece types (king, advisor, elephant, horse, chariot, cannon, soldier)
- `PieceColor`: Red and black players
- `PIECE_NAMES`: Chinese character mapping for pieces (红方/黑方)

### UnoCSS Configuration
Custom shortcuts are defined for chess-specific styling:
- `chess-square`: 16x16 board squares with borders
- `chess-piece`: 12x12 circular pieces with centered text
- `btn`, `btn-primary`, `btn-secondary`: Button variants
- `card`: Standard card styling
- `flex-center`: Flexbox centering utility

### Game Features to Implement
Based on project structure and types:
1. Board rendering with 9x10 grid (Chinese chess dimensions)
2. Piece movement validation following Xiangqi rules
3. Turn-based gameplay with move history
4. AI opponents using minimax algorithm with varying depths
5. Check/checkmate detection
6. Theme switching system
7. Sound effects and animations
8. Captured pieces display

### Key Development Notes
- Use TypeScript strictly - all game logic types are pre-defined
- Follow UnoCSS patterns for styling - leverage existing shortcuts
- Chinese chess board is 9x10 (not 8x8 like international chess)
- Pieces have different movement rules than international chess
- Red player starts first (equivalent to white in international chess)
- River divides the board between territories
- Palace areas restrict king and advisor movement
- **Code Comments**: Use JSDoc format for all function and class documentation

### Icon Usage
Tabler icons are available via UnoCSS presets:
```tsx
<div className="i-tabler-icon-name" />
```