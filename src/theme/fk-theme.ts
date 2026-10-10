import type { Config } from 'tailwindcss'
import { basePreset } from '@spektra/themes'

/**
 * Farkas Klára Tailwind preset — light, calm, typographic.
 *
 * Extends the platform basePreset. Concrete color values live as HSL channel
 * CSS variables in src/index.css (platform convention); this preset only maps
 * them to Tailwind names and defines the client type/shape/spacing scale.
 *
 * The numeric font-size keys used by platform blocks (text-4xl … text-7xl)
 * are remapped to the client scale, so platform HeroBlock / FeaturesBlock
 * headings follow the client typography without component changes:
 *   H1  text-5xl / md:text-6xl / lg:text-7xl  → ~40–52 (fluid) / 68 / 88 px
 *   H2  text-4xl / md:text-5xl                → 36 / 52 px
 *   H3  text-2xl / md:text-3xl                → 24 / 30 px
 *   Body text-base                            → 17 px
 */
const clientColor = (name: string) => `hsl(var(--fk-${name}) / <alpha-value>)`

export const fkPreset = {
  presets: [basePreset],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1240px',
      },
    },
    extend: {
      colors: {
        ink: clientColor('ink'),
        slate: clientColor('slate'),
        line: clientColor('line'),
        'surface-warm': clientColor('surface-warm'),
        // Configurable dark surface — change --fk-surface-strong in index.css
        // to lighten every dark block at once.
        'surface-strong': clientColor('surface-strong'),
        'surface-strong-raised': clientColor('surface-strong-raised'),
        'on-strong': clientColor('on-strong'),
        'muted-on-dark': clientColor('muted-on-dark'),
        'accent-text': clientColor('accent-text'),
        'accent-hover': clientColor('accent-hover'),
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        display: ['"Schibsted Grotesk"', '"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        sm: ['0.9375rem', { lineHeight: '1.5' }],
        base: ['1.0625rem', { lineHeight: '1.65' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.25' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '4xl': ['2.25rem', { lineHeight: '1.1' }],
        // Fluid: ~40px on phones (fewer H1 line breaks), 52px from tablet up.
        '5xl': ['clamp(2.5rem, 1.5rem + 4vw, 3.25rem)', { lineHeight: '1.05' }],
        '6xl': ['4.25rem', { lineHeight: '1.02' }],
        '7xl': ['5.5rem', { lineHeight: '1' }],
      },
      letterSpacing: {
        heading: '-0.035em',
        display: '-0.045em',
      },
      borderRadius: {
        lg: '0.75rem', // input
        xl: '1.5rem', // card
        '2xl': '2rem', // large block
        '3xl': '2.25rem', // large block (max)
      },
      // No decorative shadows in this client: neutralize the shadow scale used
      // by platform components (Card, FeatureCard, AboutBlock).
      boxShadow: {
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
      },
      maxWidth: {
        content: '1240px',
        prose: '44rem',
      },
    },
  },
  plugins: [],
} satisfies Partial<Config>
