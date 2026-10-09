import type { Config } from 'tailwindcss'
import { fkPreset } from './src/theme/fk-theme'

export default {
  presets: [fkPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../sp-platform/packages/components/src/**/*.{ts,tsx}',
    '../../sp-platform/packages/layouts/src/**/*.{ts,tsx}',
  ],
} satisfies Config
