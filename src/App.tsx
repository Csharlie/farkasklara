import { useEffect } from 'react'
import { FormHandlerProvider, SiteDataProvider, useSiteData } from '@spektra/runtime'
import { LandingTemplate } from '@spektra/layouts'
import { registry } from './registry'
import { AppFooter, AppHeader } from './shell'
import { createAdapter } from './data/create-adapter'
import { createFkFormHandler } from './data/create-form-handler'
import { resolvePageSlug } from './data/routes'

const adapter = createAdapter()
const formHandler = createFkFormHandler()

/**
 * Route → page. Uses the platform LandingTemplate `pageSlug` extension point;
 * every route is a SiteData page (see src/data/routes.ts). Navigation is
 * plain <a href> (full page loads), so no client router is involved.
 */
function RoutedPage() {
  const { data } = useSiteData()
  const pageSlug = data
    ? resolvePageSlug(window.location.pathname, data.pages.map((p) => p.slug))
    : undefined

  // Content renders after the adapter resolves, so the browser's initial
  // #hash scroll (e.g. /kapcsolat?szolgaltatas=…#ajanlatkeres) is re-applied.
  useEffect(() => {
    if (!data || !window.location.hash) return
    document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView()
  }, [data])

  return (
    <LandingTemplate
      registry={registry}
      pageSlug={pageSlug}
      header={AppHeader}
      footer={AppFooter}
      loading={<div className="min-h-screen bg-background" aria-busy="true" />}
      error={(error) => (
        <div role="alert" className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
          <div>
            <p className="mb-2 font-semibold text-destructive">A tartalom nem érhető el.</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      )}
      fallback={(type) => (
        <div className="p-8 text-center text-muted-foreground">Ismeretlen szekció: {type}</div>
      )}
    />
  )
}

export default function App() {
  return (
    <SiteDataProvider adapter={adapter}>
      <FormHandlerProvider handler={formHandler}>
        <RoutedPage />
      </FormHandlerProvider>
    </SiteDataProvider>
  )
}
