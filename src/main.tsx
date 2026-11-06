import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// Self-hosted fonts (no request to Google): Latin + Latin Extended (ő, ű) subsets
// of the weights used by the theme (src/theme/fk-theme.ts). Vite bundles the
// woff2 files under /assets with hashed names.
import '@fontsource/instrument-sans/latin-400.css'
import '@fontsource/instrument-sans/latin-ext-400.css'
import '@fontsource/instrument-sans/latin-500.css'
import '@fontsource/instrument-sans/latin-ext-500.css'
import '@fontsource/instrument-sans/latin-600.css'
import '@fontsource/instrument-sans/latin-ext-600.css'
import '@fontsource/schibsted-grotesk/latin-700.css'
import '@fontsource/schibsted-grotesk/latin-ext-700.css'
import '@fontsource/schibsted-grotesk/latin-800.css'
import '@fontsource/schibsted-grotesk/latin-ext-800.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
