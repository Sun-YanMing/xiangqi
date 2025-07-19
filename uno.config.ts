import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'
import tablerIcons from '@iconify-json/tabler/icons.json'

export default defineConfig({
  shortcuts: [
    // 自定义快捷类
    ['btn', 'px-4 py-2 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:opacity-50'],
    ['btn-primary', 'btn bg-blue-600 hover:bg-blue-700'],
    ['btn-secondary', 'btn bg-gray-600 hover:bg-gray-700'],
    ['card', 'bg-white rounded-lg shadow-md p-6'],
    ['flex-center', 'flex items-center justify-center'],
    ['chess-square', 'w-16 h-16 border border-gray-400 flex-center cursor-pointer relative'],
    ['chess-piece', 'w-12 h-12 rounded-full flex-center text-white font-bold text-lg select-none']
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      collections: {
        tabler: tablerIcons
      }
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Roboto',
        serif: 'Roboto Slab',
        mono: 'Fira Code'
      }
    })
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ],
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a'
      },
      secondary: {
        50: '#f9fafb',
        500: '#6b7280',
        900: '#111827'
      }
    }
  }
})