# 🏮 中国象棋 - 复古对弈

> 一款精美的现代化中国象棋游戏，融合传统文化与现代技术

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ 功能特色

### 🎮 游戏模式
- **👥 双人对战** - 本地双人对弈，体验传统象棋乐趣
- **🤖 AI对战** - 四种难度等级，从入门到大师
  - 🟢 AI入门 (2层搜索) - 适合新手练习
  - 🟡 AI业余 (3层搜索) - 中等难度挑战
  - 🟠 AI专业 (4层搜索) - 较强棋力对弈
  - 🔴 AI大师 (5层搜索) - 顶级棋力挑战

### 🎨 主题皮肤
- **🌳 复古木质** - 传统木质棋盘，古朴典雅
- **🚀 未来科技** - 现代科技风格，炫酷界面
- **🏮 国风雅韵** - 中国传统元素，古典美学
- **💎 水晶幻境** - 水晶质感设计，梦幻体验

### 🎵 音效系统
- **🔊 游戏音效** - 移动、吃子、将军等完整音效
- **🎵 背景音乐** - 悠扬的中国风背景音乐，支持循环播放
- **🎚️ 音量控制** - 独立的音效和音乐音量调节
- **🎛️ 智能播放** - 根据游戏状态智能控制音乐播放

### 🎉 视觉特效
- **✨ 胜利特效** - 精美的胜利弹框和动画效果
- **🎭 主题化界面** - 所有组件支持主题切换
- **🎬 流畅动画** - 棋子移动、选择等丰富动画效果
- **📱 响应式设计** - 完美适配桌面和移动设备

### 🛠️ 开发工具
- **🔍 开发面板** - 实时游戏状态监控和调试
- **🎯 代码检查器** - 点击元素跳转到源码（开发环境）
- **🎨 UnoCSS检查器** - 实时CSS样式调试
- **⌨️ 快捷键支持** - 丰富的键盘快捷键操作

## 🚀 技术栈

### 前端框架
- **React 19** - 最新的React框架，支持并发特性
- **TypeScript 5.8** - 强类型支持，提升开发体验
- **Vite 7** - 极速的开发构建工具

### 样式方案
- **UnoCSS** - 原子化CSS引擎，高性能样式解决方案
- **Tabler Icons** - 精美的图标库集成
- **Google Fonts** - 中国风字体支持

### 状态管理
- **Zustand** - 轻量级状态管理库
- **React Hooks** - 现代化的状态管理模式

### 开发工具
- **ESLint** - 代码质量检查
- **React Dev Inspector** - 开发时元素源码定位
- **TypeScript Strict Mode** - 严格的类型检查

## 📦 安装运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 快速开始

```bash
# 克隆项目
git clone <repository-url>
cd 象棋比赛

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 在浏览器中打开 http://localhost:3000
```

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

## 🎯 项目架构

```
src/
├── components/          # React组件
│   ├── VintageChessBoard.tsx    # 主题化棋盘组件
│   ├── VictoryOverlay.tsx       # 胜利特效组件
│   ├── GameInfoPanel.tsx        # 游戏信息面板
│   ├── GameSettings.tsx         # 游戏设置界面
│   └── ThemeSelector.tsx        # 主题选择器
├── hooks/               # 自定义Hooks
│   ├── useChessGame.ts          # 游戏逻辑Hook
│   └── useTheme.ts              # 主题管理Hook
├── utils/               # 工具函数
│   ├── moveValidation.ts        # 象棋规则验证
│   ├── aiEngine.ts              # AI引擎
│   ├── soundEffects.ts          # 音效管理
│   └── animationManager.ts      # 动画管理
├── types/               # TypeScript类型定义
├── styles/              # 样式文件
│   ├── themes.css               # 主题样式
│   └── vintage.css              # 复古风格样式
└── assets/              # 静态资源
    ├── bg-yinyue.mp4           # 背景音乐
    └── image/                   # 图片资源
```

## 🎮 游戏特性

### 象棋规则完整实现
- ✅ 所有棋子移动规则
- ✅ 将军检查和应将
- ✅ 将死判断
- ✅ 双将对脸检测
- ✅ 悔棋功能
- ✅ 移动历史记录

### AI智能算法
- 🧠 Minimax算法实现
- 🔍 Alpha-Beta剪枝优化
- ⚡ FastAI引擎备用
- 📊 局面评估函数
- 🎯 多层深度搜索

### 用户体验优化
- 💾 游戏状态持久化
- 📈 游戏统计和历史
- ⌨️ 键盘快捷键支持
- 🎨 无障碍访问支持
- 📱 移动端适配

## 🎨 主题系统

每个主题包含完整的配色方案：

```typescript
interface ThemeConfig {
  name: string              // 主题名称
  description: string       // 主题描述
  icon: string             // 主题图标
  colors: {
    primary: string         // 主色调
    secondary: string       // 次要颜色
    accent: string          // 强调色
    surface: string         // 表面颜色
    textPrimary: string     // 主要文本
    textSecondary: string   // 次要文本
    textAccent: string      // 强调文本
    // ... 更多颜色配置
  }
}
```

## 🔊 音效系统

### 游戏音效
- 🎵 移动音效 - 棋子移动时播放
- 💥 吃子音效 - 棋子被吃时播放
- ⚠️ 将军音效 - 将军时的警告音
- 🏆 胜利音效 - 游戏结束时播放
- 🔘 选择音效 - 选择棋子时播放
- ❌ 无效音效 - 无效移动时播放

### 背景音乐
- 🎼 中国风背景音乐循环播放
- 🎛️ 音量控制（0-100%）
- 🎚️ 独立开关控制
- 🎮 游戏状态联动（胜利时停止，重新开始时恢复）

## 💡 开发亮点

### 代码质量
- **TypeScript严格模式** - 完整的类型安全
- **ESLint规则** - 统一的代码风格
- **函数式编程** - Hooks和纯函数设计
- **模块化架构** - 清晰的代码组织

### 性能优化
- **React 19特性** - 并发渲染和自动批处理
- **UnoCSS** - 按需生成CSS，极小的包体积
- **代码分割** - 异步组件加载
- **缓存策略** - 智能的资源缓存

### 开发体验
- **HMR热更新** - 极速的开发反馈
- **TypeScript智能提示** - 完整的类型推导
- **开发工具集成** - 调试和性能分析
- **源码映射** - 生产环境调试支持

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 联系我们

- 项目链接: [GitHub Repository]
- 问题反馈: [Issues]
- 功能建议: [Discussions]

---

<div align="center">

**🏮 传承千年棋艺，体验现代科技 🏮**

*Made with ❤️ by 象棋比赛项目团队*

</div>