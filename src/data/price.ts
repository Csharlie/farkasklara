import type { Price, PriceAmount, Service, Settings } from '../content/types'

/** Render-ready price. Serializable — travels inside section data. */
export interface FormattedPrice {
  /** e.g. '35 000 Ft-tól', '[ÁR] Ft', 'Egyedi ajánlat alapján' */
  amount: string
  /** e.g. '/ hó', '/ fő/hó' */
  unit?: string
  note?: string
  vatNote?: string
}

const numberFormat = new Intl.NumberFormat('hu-HU')

function formatAmount(amount: PriceAmount): string {
  return typeof amount === 'number' ? `${numberFormat.format(amount)} Ft` : `${amount} Ft`
}

export function formatPrice(price: Price): FormattedPrice {
  const extra = { note: price.note, vatNote: price.vatNote }
  switch (price.type) {
    case 'fixed':
      return { amount: formatAmount(price.amount), unit: price.unit && `/ ${price.unit}`, ...extra }
    case 'from':
      return { amount: `${formatAmount(price.amount)}-tól`, unit: price.unit && `/ ${price.unit}`, ...extra }
    case 'range':
      return {
        amount: `${formatAmount(price.amount).replace(/ Ft$/, '')} – ${formatAmount(price.amountMax)}`,
        unit: price.unit && `/ ${price.unit}`,
        ...extra,
      }
    case 'perUnit':
      return { amount: formatAmount(price.amount), unit: `/ ${price.unit}`, ...extra }
    case 'onRequest':
      return { amount: 'Egyedi ajánlat alapján', ...extra }
  }
}

/**
 * The single gate for price visibility. Every price UI (service cards,
 * service page price block) goes through here — settings.showPrices = false
 * means no price data reaches any component.
 */
export function visiblePrice(service: Service, settings: Settings): FormattedPrice | undefined {
  if (!settings.showPrices || !service.price) return undefined
  return formatPrice(service.price)
}
