import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
} from 'unocss'
import presetRemToPx from '@unocss/preset-rem-to-px'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetRemToPx({ baseFontSize: 4 }),
  ],
  shortcuts: [
    [/^wh-(.*)$/, ([, size]) => `w-${size} h-${size}`],
    ['center', 'flex justify-center items-center'],
    ['x-center', 'flex justify-center'],
    ['x-between', 'flex justify-between'],
    ['y-center', 'flex items-center'],
  ]
})
