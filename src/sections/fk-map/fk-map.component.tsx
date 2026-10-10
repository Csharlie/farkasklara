import type { FkMapData } from './fk-map.schema'

/**
 * Full-width Google Maps embed — follows the bc-map / lc-map client pattern.
 * Uses the direct embed endpoint: the classic `/maps?q=…&output=embed` URL
 * answers with a 301 carrying `X-Frame-Options: SAMEORIGIN`, so browsers
 * refuse to frame it and the section stays empty.
 */
export function FkMap({ title, query, height = 500, zoom = 15 }: FkMapData) {
  const encodedQuery = encodeURIComponent(query)

  return (
    <section
      id="terkep"
      data-ui-id="section-fk-map"
      data-ui-component="fk-map"
      data-ui-role="map"
      className="border-t-4 border-surface-strong bg-muted"
    >
      {title && (
        <h2 data-ui-id="map-title" data-ui-role="section-title" className="sr-only">
          {title}
        </h2>
      )}
      <iframe
        title={title ?? 'Térkép'}
        src={`https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${encodedQuery}!6i${zoom}`}
        width="100%"
        height={height}
        style={{ border: 0, display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </section>
  )
}
