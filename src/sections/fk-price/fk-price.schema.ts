import type { FormattedPrice } from '../shared/types'

export interface FkPriceData {
  id: string
  title: string
  price: FormattedPrice
  tone?: 'plain' | 'warm'
}
