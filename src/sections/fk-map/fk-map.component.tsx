import type { FkMapData } from './fk-map.schema'

/** Full-width Google Maps embed — follows the bc-map / lc-map client pattern. */
export function FkMap({ title, query, height = 500, zoom = 14 }: FkMapData) {
  const encodedQuery = encodeURIComponent(query)

  return (
    <section
      id="terkep"
      data-ui-id="section-fk-map"
      data-ui-component="fk-map"
      data-ui-role="map"
      className="border-t border-border bg-muted"
    >
      {title && (
        <h2 data-ui-id="map-title" data-ui-role="section-title" className="sr-only">
          {title}
        </h2>
      )}
      <iframe
        title={title ?? 'Térkép'}
        src={`https://www.google.com/maps?q=${encodedQuery}&z=${zoom}&output=embed`}
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
